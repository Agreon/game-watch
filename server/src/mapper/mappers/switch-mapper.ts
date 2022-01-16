
import { InfoSourceType } from "@game-watch/shared";

import { UrlMapper } from "../mapper-service";

export class SwitchMapper implements UrlMapper {
    public type = InfoSourceType.Switch;

    public async mapUrlToId(url: string): Promise<string> {
        const { hostname } = new URL(url);
        if (hostname !== "www.nintendo.de") {
            throw new Error("Not mappable");
        }

        return url;
    }
}
