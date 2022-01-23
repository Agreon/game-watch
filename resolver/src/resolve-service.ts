import { Logger } from "@game-watch/service";
import { GameDataU, InfoSourceType } from "@game-watch/shared";
import * as Sentry from '@sentry/node';

export interface InfoResolverContext {
    logger: Logger
}

export interface InfoResolver<T extends GameDataU = GameDataU> {
    type: InfoSourceType;
    resolve: (id: string, context: InfoResolverContext) => Promise<T>;
}

export class ResolveService {
    public constructor(
        private readonly resolvers: InfoResolver[]
    ) { }

    public async resolveGameInformation(
        id: string,
        type: InfoSourceType,
        context: InfoResolverContext
    ): Promise<GameDataU | null> {
        const logger = context.logger.child({ service: ResolveService.name, });

        const resolverForType = this.resolvers.find(resolver => resolver.type == type);
        if (!resolverForType) {
            throw new Error(`No resolver for type ${type} found`);
        }

        const start = new Date().getTime();

        try {
            return await resolverForType.resolve(id, { logger: logger.child({ type }) });
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
