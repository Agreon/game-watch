import { InfoSource } from '@game-watch/database';
import { CacheService, Logger } from '@game-watch/service';
import { Country, GameDataU, InfoSourceState, InfoSourceType } from '@game-watch/shared';
import axios from 'axios';

export interface InfoResolverContext {
    logger: Logger
    userCountry: Country
    source: InfoSource<InfoSourceType, InfoSourceState.Found>
}

export interface InfoResolver<T extends GameDataU = GameDataU> {
    type: InfoSourceType
    resolve: (context: InfoResolverContext) => Promise<T>
}

export class CriticalError extends Error {
    public constructor(
        public sourceType: InfoSourceType,
        public originalError: Error
    ) { super(); }
}

export class ResolveService {
    public constructor(
        private readonly resolvers: InfoResolver[],
        private readonly cacheService: CacheService,
    ) { }

    public async resolveGameInformation(context: InfoResolverContext): Promise<GameDataU> {
        const { type, data: { id } } = context.source;
        const logger = context.logger.child({ serviceName: ResolveService.name, type, id });

        const resolverForType = this.resolvers.find(resolver => resolver.type == type);
        if (!resolverForType) {
            throw new Error(`No resolver for type ${type} found`);
        }

        const cacheKey = `${type}:${context.userCountry}:${id}`.toLocaleLowerCase();

        const existingData = await this.cacheService.get<GameDataU>(cacheKey);
        if (existingData) {
            logger.debug(`Data for ${cacheKey} was found in cache`);

            return existingData;
        }

        const start = new Date().getTime();

        try {
            const resolvedData = await resolverForType.resolve({ ...context, logger });
            await this.cacheService.set(cacheKey, resolvedData);

            return resolvedData;
        } catch (error) {
            if (
                // We only want to retry on network errors that are not signaling us to stop.
                (axios.isAxiosError(error) && error.response?.status !== 403)
                // This error occurs if Puppeteer timeouts.
                || error.name === 'TimeoutError'
            ) {
                throw error;
            }

            logger.warn("Retrying likely won't help. Aborting immediately");
            throw new CriticalError(type, error);
        } finally {
            const duration = new Date().getTime() - start;
            logger.debug(`Resolving ${type} took ${duration} ms`);
        }
    }
}
