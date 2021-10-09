import { Flex } from "@chakra-ui/layout";
import { useGameContext } from "../providers/GameProvider";
import { GameTile } from "./GameTile";

export const GameGrid: React.FC = () => {
    const { games } = useGameContext();

    return (
        <Flex wrap="wrap" mt="3em" flexDirection={["column", "row"]}>
            {games.map(game => <GameTile key={game.id} game={game} />)}
        </Flex>
    )
}