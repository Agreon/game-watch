import { EmptyResponseError } from '@game-watch/browser';
import { InfoSource, Notification } from '@game-watch/database';
import { NIGHTLY_JOB_OPTIONS, QueueParams, QueueType } from '@game-watch/queue';
import { CacheService, Logger } from '@game-watch/service';
import {
    AnyGameData,
    InfoSourceState,
    InfoSourceType,
    NotificationType,
} from '@game-watch/shared';
import { EntityManager } from '@mikro-orm/core';
import axios from 'axios';
import { Queue } from 'bullmq';

export interface InfoResolverContext {
    logger: Logger
    source: InfoSource<InfoSourceType, InfoSourceState.Found>
}

export interface InfoResolver<T extends AnyGameData = AnyGameData> {
    type: InfoSourceType
    resolve: (context: InfoResolverContext) => Promise<T>
}

export class CriticalError extends Error {
    public constructor(
        public sourceType: InfoSourceType,
        public originalError: Error
    ) {
        super();
    }
}

export class ResolveService {
    public constructor(
        private readonly resolvers: InfoResolver[],
        private readonly cacheService: CacheService,
        private readonly createNotificationsQueue:
            Queue<QueueParams[QueueType.CreateNotifications]>,
        private readonly em: EntityManager,
        private readonly sourceScopedLogger: Logger
    ) { }

    public async resolveSource({ sourceId, triggeredManually, isLastAttempt }: {
        sourceId: string
        triggeredManually?: boolean
        isLastAttempt: boolean
    }) {
        const startTime = new Date().getTime();

        const source = await this.em
            .findOneOrFail(
                InfoSource,
                {
                    id: sourceId,
                    state: { $ne: InfoSourceState.Disabled }
                },
                { populate: ['user'] }
            );

        const logger = this.sourceScopedLogger.child({
            type: source.type,
            country: source.country
        });

        logger.info(`Resolving ${source.type} for country ${source.country}`);

        try {
            const resolvedGameData = await this.resolveGameInformation(
                { source, logger, triggeredManually }
            );

            logger.debug(`Resolved source information in ${source.type}`);

            await this.em.nativeUpdate(InfoSource, sourceId, {
                state: InfoSourceState.Resolved,
                data: resolvedGameData,
                updatedAt: new Date()
            });

            if (!triggeredManually) {
                await this.addToNotificationQueue({
                    sourceId,
                    resolvedGameData,
                    existingGameData: source.data as AnyGameData,
                });
            }

            // Delete old, unnecessary ResolveError notifications so that on a new error a
            // new notification is created.
            await this.em.nativeDelete(Notification, {
                infoSource: source as InfoSource,
                type: NotificationType.ResolveError,
            });

            const duration = new Date().getTime() - startTime;
            logger.debug(`Resolving source took ${duration} ms`);
        } catch (error) {
            logger.warn(`Source ${source.type} could not be resolved`);

            // Allow retry in these cases
            if (
                // This error occurs if Puppeteer timeouts.
                error.name === 'TimeoutError'
                || error.message.includes('ERR_NETWORK_CHANGED')
                || error instanceof EmptyResponseError
                || (
                    axios.isAxiosError(error)
                    && error.response?.status !== undefined
                    // We only want to retry on network errors that are not signaling us to stop.
                    && [400, 401, 403, 429].includes(error.response.status) === false
                )
            ) {
                if (isLastAttempt) {
                    await this.setResolveError({ source, triggeredManually });
                }

                throw error;
            }

            logger.warn("Retrying likely won't help. Aborting immediately");

            await this.setResolveError({ source, triggeredManually });
            throw new CriticalError(source.type, error);
        }
    }

    private async setResolveError(
        { source, triggeredManually }: {
            source: InfoSource<InfoSourceType, InfoSourceState.Found>;
            triggeredManually?: boolean;
        },
    ) {
        if (!triggeredManually) {
            await this.addToNotificationQueue({
                sourceId: source.id,
                // Will trigger a ResolveError Notification.
                resolvedGameData: null,
                existingGameData: source.data as AnyGameData,
            });
        }

        await this.em.nativeUpdate(InfoSource, source.id, {
            state: InfoSourceState.Error,
            updatedAt: new Date()
        });
    }

    private async resolveGameInformation(
        context: InfoResolverContext & { triggeredManually?: boolean }
    ): Promise<AnyGameData> {
        const { source: { country, type, data: { id } }, logger, triggeredManually } = context;

        const cacheKey = `${type}:${country}:${id}`.toLocaleLowerCase();

        if (!triggeredManually) {
            const existingData = await this.cacheService.get<AnyGameData>(cacheKey);
            if (existingData) {
                logger.debug(`Data for ${cacheKey} was found in cache`);

                return existingData;
            }
        }

        const startTime = new Date().getTime();

        const resolvedData = await this
            .getResolverForTypeOrFail(type)
            .resolve(context);

        const duration = new Date().getTime() - startTime;
        logger.debug(`Resolving ${type} took ${duration} ms`);

        await this.cacheService.set(cacheKey, resolvedData);

        return resolvedData;
    }

    private getResolverForTypeOrFail(type: InfoSourceType): InfoResolver {
        const resolverForType = this.resolvers.find(resolver => resolver.type == type);
        if (!resolverForType) {
            throw new Error(`No resolver for type ${type} found`);
        }
        return resolverForType;
    }

    private async addToNotificationQueue(
        { sourceId, existingGameData, resolvedGameData }: {
            sourceId: string
            existingGameData: AnyGameData
            resolvedGameData: AnyGameData | null
        }
    ) {
        await this.createNotificationsQueue.add(
            QueueType.CreateNotifications,
            {
                sourceId,
                existingGameData,
                resolvedGameData,
            },
            {
                jobId: sourceId,
                priority: 2,
                ...NIGHTLY_JOB_OPTIONS
            }
        );
    }
}
