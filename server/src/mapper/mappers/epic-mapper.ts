import { InfoSourceType } from "@game-watch/shared";

import { UrlMapper } from "../mapper-service";

export class EpicResolver implements UrlMapper {
    public type = InfoSourceType.Epic;

    public async mapUrlToId(url: string): Promise<string> {
        const mapped = new URL(url);
        if (mapped.hostname !== "www.epicgames.com") {
            throw new Error("Not mappable");
        }

        return mapped.href;
    }
}
