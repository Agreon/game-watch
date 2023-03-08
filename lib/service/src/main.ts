import { BaseGameData, Country, InfoSourceType } from '@game-watch/shared';
import { Logger } from 'pino';

export interface InfoSearcherContext {
    logger: Logger
    userCountry: Country
}

export interface InfoSearcher {
    type: InfoSourceType
    search(name: string, context: InfoSearcherContext): Promise<BaseGameData | null>
}

export { createLogger, Logger } from './create-logger';
export { parseEnvironment } from './parse-environment';
export { initializeSentry } from './initialize-sentry';
export { extract } from './extract';
export { CacheService, RedisCacheService, NonCachingService } from './cache-service';
export { getCronForNightlySync } from './get-cron-for-nightly-sync';
