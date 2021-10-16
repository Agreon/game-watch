import { Box, Flex } from "@chakra-ui/layout";
import { useGameContext } from "../providers/GameProvider";
import { GameTile } from "./GameTile/GameTile";
import { LoadingSpinner } from "./LoadingSpinner";

export const GameGrid: React.FC = () => {
    const { games, gamesLoading } = useGameContext();

    return (
        <Flex wrap="wrap" mt="2rem" flexDirection={["column", "row"]} justify="center" >
            {gamesLoading && <Box position="relative" width="100%" mt="5rem"><LoadingSpinner size="xl" /></Box>}
            {games.map(game => <GameTile key={game.id} game={game} />)}
        </Flex>
    )
}