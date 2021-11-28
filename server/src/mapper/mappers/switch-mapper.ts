
import { InfoSourceType } from "@game-watch/shared";

import { UrlMapper } from "../mapper-service";

export class SwitchMapper implements UrlMapper {
    public type = InfoSourceType.Switch;

    public async mapUrlToId(url: string): Promise<string> {
        const { hostname } = new URL(url);
        if (hostname !== "www.nintendo.de") {
            throw new Error("Not mappable");
        }

        // TODO: We should crawl the site for deterministic results :/
        // https://www.nintendo.de/Spiele/Nintendo-Switch/Bayonetta-3-2045649.html
        // => Extracts Last part without stuff behind last-
        const urlParts = url.split("/");
        const idPart = urlParts[urlParts.length - 1];
        const idParts = idPart.split("-").slice(0, -1);

        return idParts.join(" ");
    }
}
