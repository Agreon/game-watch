
import { InfoSourceType } from "@game-watch/shared";

import { UrlMapper } from "../mapper-service";

export class PsStoreMapper implements UrlMapper {
    public type = InfoSourceType.PsStore;

    public async mapUrlToId(url: string): Promise<string> {
        const { hostname } = new URL(url);
        if (hostname !== "store.playstation.com") {
            throw new Error("Not mappable");
        }

        return url;
    }
}
