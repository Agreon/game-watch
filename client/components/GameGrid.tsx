import { Box } from '@chakra-ui/react';
import Masonry from 'react-masonry-css';

import { GameProvider } from '../providers/GameProvider';
import { useGamesContext } from '../providers/GamesProvider';
import { useNotificationContext } from '../providers/NotificationProvider';
import { GameTile } from './GameTile/GameTile';
import { LoadingSpinner } from './LoadingSpinner';

export const GameGrid: React.FC = () => {
    const { removeNotificationsForInfoSource } = useNotificationContext();
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
            className="game-grid"
            columnClassName="game-grid_column"
        >
            {setupGames.map(game =>
                <GameProvider
                    key={game.id}
                    game={game}
                    setGame={setGame}
                    removeGame={removeGame}
                    removeNotificationsForInfoSource={removeNotificationsForInfoSource}
                >
                    <GameTile />
                </GameProvider>
            )}
        </Masonry>
    );
};
