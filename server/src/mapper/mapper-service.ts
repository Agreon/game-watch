import { InfoSourceType } from "@game-watch/shared";
import { Inject, Injectable, Logger } from "@nestjs/common";
import * as Sentry from '@sentry/node';

export interface UrlMapper {
    type: InfoSourceType;
    mapUrlToId: (url: string) => Promise<string>;
}

export class UrlNotMappableError extends Error { }

@Injectable()
export class MapperService {
    private readonly logger = new Logger(MapperService.name);

    public constructor(
        @Inject("MAPPERS")
        private readonly mappers: UrlMapper[]
    ) { }

    public async mapUrlToResolverId(url: string, type: InfoSourceType): Promise<string> {
        const mapperForType = this.getMapperForInfoSourceType(type);

        try {
            return await mapperForType.mapUrlToId(url);
        } catch (error) {
            Sentry.captureException(error, {
                contexts: {
                    mapParameters: {
                        url,
                        type
                    }
                }
            });
            this.logger.warn(error);
            throw new UrlNotMappableError();
        }
    }

    private getMapperForInfoSourceType(type: InfoSourceType) {
        const mapperForType = this.mappers.find(mapper => mapper.type == type);
        if (!mapperForType) {
            throw new Error(`No mapper for type ${type} found`);
        }
        return mapperForType;
    }

}
