import { Controller, Param, Post } from "@nestjs/common";
import { InfoSourceService } from "./infou-source-service";

@Controller("/info-source")
export class InfoSourceController {
    public constructor(
        private readonly infoSourceService: InfoSourceService
    ) { }

    @Post("/:infoSourceId/disable")
    public async disableInfoSource(
        @Param("infoSourceId") infoSourceId: string
    ) {
        return await this.infoSourceService.disableInfoSource(infoSourceId);
    }
}