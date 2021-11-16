import { InfoSourceType } from "@game-watch/shared";

import { UrlMapper } from "../mapper-service";

export class MetacriticMapper implements UrlMapper {
    public type = InfoSourceType.Metacritic;

    public async mapUrlToId(url: string): Promise<string> {
        const { hostname } = new URL(url);
        if (hostname !== "www.metacritic.com") {
            throw new Error("Not mappable");
        }

        return url;
    }
}