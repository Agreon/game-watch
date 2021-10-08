/* eslint-disable @next/next/no-img-element */
import { Flex } from "@chakra-ui/layout";
import { useMemo } from "react";
import { Game } from "../providers/GameProvider";
// TODO: RM
import styles from '../styles/Home.module.css'
import { InfoSource } from "./InfoSource";

// TODO: Let users select the priority / image
const INFO_SOURCE_PRIORITY = [
    "psStore",
    "steam",
    "nintendo",
]

const retrieveDataFromInfoSources = (game: Game, key: string): string | null => {
    for (const sourceType of INFO_SOURCE_PRIORITY) {
        const matchingSource = game.infoSources.find(source => source.type === sourceType);
        if (matchingSource && matchingSource.data[key]) {

            if (key === "thumbnailUrl") {
                const thumbnailUrl = matchingSource.data[key] as string;

                if (matchingSource.type === "nintendo") {
                    return thumbnailUrl
                        .replace(/w_(\d*)/, "w_460")
                        .replace(/h_(\d*)/, "h_215")
                }

                if (matchingSource.type === "psStore") {
                    const url = new URL(thumbnailUrl);
                    url.searchParams.delete("w");
                    url.searchParams.append("w", "460");
                    return url.toString();
                }
            }

            return matchingSource.data[key] as string;
        }
    }

    return null;
}

export const GameTile: React.FC<{ game: Game }> = ({ game }) => {
    const { fullName, thumbnail } = useMemo(() => ({
        fullName: retrieveDataFromInfoSources(game, "fullName"),
        thumbnail: retrieveDataFromInfoSources(game, "thumbnailUrl"),
    }), [game])

    return (
        <a key={game.id} className={styles.card} style={{ minWidth: "510px", maxWidth: "510px" }}>
            <Flex justifyContent="center">
                {thumbnail &&
                    <img
                        alt="thumbnail"
                        src={thumbnail}
                        width="460"
                        style={{ objectFit: "contain", height: "215px" }}
                    />
                }
            </Flex>
            <h2 style={{ marginTop: "1rem" }}>{fullName ?? game.name}</h2>
            <div>
                {game.infoSources.map(source => <InfoSource key={source.id} source={source} />)}
            </div>
        </a>
    )
}