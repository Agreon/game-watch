import { Logger } from "@game-watch/service";
import { GameDataU, InfoSourceType } from "@game-watch/shared";
import * as Sentry from '@sentry/node';
import { Redis } from "ioredis";
import pRetry from "p-retry";

export interface InfoResolverContext {
    logger: Logger
}

export interface ResolveServiceContext extends InfoResolverContext {
    skipCache?: boolean
}

export interface InfoResolver<T extends GameDataU = GameDataU> {
    type: InfoSourceType;
    resolve: (id: string, context: InfoResolverContext) => Promise<T>;
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
        const logger = context.logger.child({ serviceName: ResolveService.name, });

        const resolverForType = this.resolvers.find(resolver => resolver.type == type);
        if (!resolverForType) {
            throw new Error(`No resolver for type ${type} found`);
        }

        const start = new Date().getTime();

        try {
            return await pRetry(async () => {
                const existingData = await this.redis.get(id);
                if (existingData && !context.skipCache) {
                    logger.debug(`Data for ${id} was found in cache`);

                    return JSON.parse(existingData);
                }

                const resolvedData = await resolverForType.resolve(id, { logger: logger.child({ type }) });
                await this.redis.set(id, JSON.stringify(resolvedData), "EX", 60 * 60 * 23);

                return resolvedData;
            }, {
                minTimeout: 5000,
                maxTimeout: 30000
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
            logger.child({ type }).warn(error);
            return null;
        } finally {
            const duration = new Date().getTime() - start;
            logger.debug(`Resolving ${type} took ${duration} ms`);
        }
    }
}
