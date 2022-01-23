import { Box } from "@chakra-ui/layout";
import { useGamesContext } from "../providers/GamesProvider";
import { GameProvider } from "../providers/GameProvider";
import { GameTile } from "./GameTile/GameTile";
import { LoadingSpinner } from "./LoadingSpinner";
import Masonry from "react-masonry-css";

/**
 * TODO: Set custom breakpoints as default to use everywhere!
 */
export const GameGrid: React.FC = () => {
    const { games, setGame, removeGame, gamesLoading } = useGamesContext();

    if (gamesLoading) {
        return (
            <Box position="relative" width="100%" mt="5rem">
                <LoadingSpinner size="xl" />
            </Box>
        );
    }

    const setupGames = games.filter(game => game.setupCompleted);

    return (
        <Masonry
            breakpointCols={{
                default: 4,
                1900: 3,
                1460: 2,
                1000: 1
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
        >
            {setupGames.map(game =>
                <GameProvider key={game.id} game={game} setGame={setGame} removeGame={removeGame}>
                    <GameTile />
                </GameProvider>
            )}
        </Masonry>
    );
}