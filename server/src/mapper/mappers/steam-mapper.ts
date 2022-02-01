import { InfoSourceType } from "@game-watch/shared";

import { UrlMapper } from "../mapper-service";

export class SteamMapper implements UrlMapper {
    public type = InfoSourceType.Steam;

    public async mapUrlToId(url: string): Promise<string> {
        const { hostname } = new URL(url);
        if (hostname !== "store.steampowered.com") {
            throw new Error("Not mappable");
        }

        const parts = url.split("/");
        const gameId = parts[parts.length - 3];
        if (!gameId.length) {
            throw new Error("Could not extract gameId");
        }

        return encodeURIComponent(gameId);
    }
}
