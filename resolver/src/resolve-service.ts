import { Logger } from "@game-watch/service";
import { Country, GameDataU, InfoSourceType } from "@game-watch/shared";
import * as Sentry from '@sentry/node';
import axios from "axios";
import { Redis } from "ioredis";
import pRetry from "p-retry";

export interface InfoResolverContext {
    logger: Logger
    userCountry: Country
}

export interface ResolveServiceContext extends InfoResolverContext {
    skipCache?: boolean
    initialRun?: boolean
}

export interface InfoResolver<T extends GameDataU = GameDataU> {
    type: InfoSourceType
    resolve: (id: string, context: InfoResolverContext) => Promise<T>
}

export class ResolveService {
    public constructor(
        private readonly resolvers: InfoResolver[],
        private readonly redis: Redis,
    ) { }

    public async resolveGameInformation(
        id: string,
        type: InfoSourceType,
        context: ResolveServiceContext
    ): Promise<GameDataU | null> {
        const logger = context.logger.child({ serviceName: ResolveService.name, type, id });

        const resolverForType = this.resolvers.find(resolver => resolver.type == type);
        if (!resolverForType) {
            throw new Error(`No resolver for type ${type} found`);
        }

        const start = new Date().getTime();
        const cacheKey = `${type}:${context.userCountry}:${id}`;

        try {
            return await pRetry(async () => {
                const existingData = await this.redis.get(cacheKey);
                if (existingData && !context.skipCache) {
                    logger.debug(`Data for ${cacheKey} was found in cache`);

                    return JSON.parse(existingData);
                }

                const resolvedData = await resolverForType.resolve(id, { ...context, logger });
                await this.redis.set(cacheKey, JSON.stringify(resolvedData), "EX", 60 * 60 * 23);

                return resolvedData;
            }, {
                minTimeout: 5000,
                maxTimeout: 30000,
                // If the user is actively waiting don't retry to often
                retries: context.initialRun || context.skipCache ? 2 : 5,
                onFailedAttempt: error => {
                    logger.warn(error, `Error thrown while resolving ${type} for ${id}`);
                    // We only want to retry on network errors that are not signaling us to stop anyway.
                    if(
                        // Epic throws a 403 at the moment.
                        (axios.isAxiosError(error) && error.response?.status !== 403)
                        // This error occurs if Puppeteer timeouts.
                        || error.name === "TimeoutError"
                    ) {
                        return;
                    }
                    logger.warn("Retrying likely won't help. Aborting immediately");
                    throw error;
                }
            });
        } catch (error) {
            Sentry.captureException(error, {
                contexts: {
                    resolveParameters: {
                        id,
                        type
                    }
                }
            });
            logger.error(error);
            return null;
        } finally {
            const duration = new Date().getTime() - start;
            logger.debug(`Resolving ${type} took ${duration} ms`);
        }
    }
}
