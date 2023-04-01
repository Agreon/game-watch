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

    return (
        <>
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
                {games
                    .filter(({ setupCompleted }) => setupCompleted)
                    .map(game =>
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
            {gamesLoading && (
                <Box
                    position="relative"
                    width="100%"
                    mt={!games.length ? '5rem' : '3rem'}
                    mb="6rem"
                >
                    <LoadingSpinner size="xl" />
                </Box>
            )}
        </>

    );
};
