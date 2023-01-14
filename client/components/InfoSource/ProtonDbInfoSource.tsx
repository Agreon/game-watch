import { Box } from '@chakra-ui/react';
import { ProtonGameData } from '@game-watch/shared';

import { InfoSourceWrapper } from './InfoSourceWrapper';

// TODO: Use pictures
export const ProtonDbInfoSource: React.FC<{ data: ProtonGameData }> = ({ data }) => {
    return (<InfoSourceWrapper>
        <Box flex="1">
            {data.score}
        </Box>
    </InfoSourceWrapper>);
};
