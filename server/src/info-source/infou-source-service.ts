import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Logger } from "@nestjs/common";
import { InfoSource } from "./info-source-model";

@Injectable()
export class InfoSourceService {
    private readonly logger = new Logger(InfoSourceService.name);

    public constructor(
        @InjectRepository(InfoSource)
        private readonly infoSourceRepository: EntityRepository<InfoSource>
    ) { }

    public async disableInfoSource(id: string) {
        const infoSource = await this.infoSourceRepository.findOneOrFail(id);
        infoSource.disabled = true;
        await this.infoSourceRepository.persistAndFlush(infoSource);

        // TODO: Do we get a new updatedAt?
        return infoSource;
    }
}