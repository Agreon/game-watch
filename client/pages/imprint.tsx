import { Box, Text } from '@chakra-ui/react';
import { NextPage } from 'next';

const Legal: NextPage = () => {
    return (
        <Box>
            <Text fontSize="2xl">Imprint</Text>

            <p>Daniel Huth<br />
                Im Langgarten 1<br />
                63589 Linsengericht</p>

            <Text fontSize="xl" mt="1rem">Contact</Text>
            <p>Mail: huth at duck dot com</p>
        </Box>
    );
};

export default Legal;
