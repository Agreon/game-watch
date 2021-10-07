import { Inject, Injectable, Logger } from "@nestjs/common";
import { GameDataU, InfoSourceType } from "../game/info-source-model";

export interface InfoResolver<T extends GameDataU = GameDataU> {
    type: InfoSourceType;
    resolve(id: string): Promise<T>;
}

@Injectable()
export class ResolveService {
    private readonly logger = new Logger(ResolveService.name);

    public constructor(
        @Inject("RESOLVERS")
        private readonly resolvers: InfoResolver[]
    ) { }

    public async resolveGameInformation(id: string, type: InfoSourceType): Promise<GameDataU | null> {
        const resolverForType = this.resolvers.find(resolver => resolver.type == type);
        if (!resolverForType) {
            throw new Error(`No resolver for type ${type} found`);
        }

        try {
            return await resolverForType.resolve(id);
        } catch (error) {
            // TODO: Or show user Something unexpected went wrong
            this.logger.warn(error);
            return null;
        }
    }
}