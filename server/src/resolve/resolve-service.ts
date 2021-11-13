import { Inject, Injectable, Logger } from "@nestjs/common";
import * as Sentry from '@sentry/node';
import { GameDataU, InfoSourceType } from "game-watch-shared";


export interface InfoResolver<T extends GameDataU = GameDataU> {
    type: InfoSourceType;
    resolve: (id: string) => Promise<T>;
    mapUrlToId: (url: string) => Promise<string>;
}

export class UrlNotMappableError extends Error { }

@Injectable()
export class ResolveService {
    private readonly logger = new Logger(ResolveService.name);

    public constructor(
        @Inject("RESOLVERS")
        private readonly resolvers: InfoResolver[]
    ) { }

    public async resolveGameInformation(id: string, type: InfoSourceType): Promise<GameDataU | null> {
        const resolverForType = this.getResolverForInfoSourceType(type);

        this.logger.debug(`Resolving ${type} for '${id}'`);
        const start = new Date().getTime();

        try {
            return await resolverForType.resolve(id);
        } catch (error) {
            Sentry.captureException(error, {
                contexts: {
                    resolveParameters: {
                        id,
                        type
                    }
                }
            });
            this.logger.warn(`[${type}]: ${error}`);
            return null;
        } finally {
            const duration = new Date().getTime() - start;
            this.logger.debug(`Resolving ${type} took ${duration} ms`);
        }
    }

    public async mapUrlToResolverId(url: string, type: InfoSourceType): Promise<string> {
        const resolverForType = this.getResolverForInfoSourceType(type);

        try {
            return await resolverForType.mapUrlToId(url);
        } catch (error) {
            Sentry.captureException(error, {
                contexts: {
                    resolveParameters: {
                        url,
                        type
                    }
                }
            });
            this.logger.warn(error);
            throw new UrlNotMappableError();
        }
    }

    private getResolverForInfoSourceType(type: InfoSourceType) {
        const resolverForType = this.resolvers.find(resolver => resolver.type == type);
        if (!resolverForType) {
            throw new Error(`No resolver for type ${type} found`);
        }
        return resolverForType;
    }

}
