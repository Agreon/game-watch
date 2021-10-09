import { Input } from "@chakra-ui/input";
import { Button } from "@chakra-ui/react";
import { Flex } from "@chakra-ui/layout";
import { useState, useCallback } from "react";
import { useGameContext } from "../providers/GameProvider";

export const AddGame: React.FC = () => {
    const { addGame } = useGameContext();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");

    const searchGame = useCallback(async () => {
        setLoading(true);
        try {
            await addGame(name);
            setName("");
        } finally {
            setLoading(false);
        }
    }, [addGame, name, setName]);

    const onNameKeyPress = useCallback(async ({ key }) => {
        if (key === "Enter") {
            await searchGame();
        }
    }, [searchGame]);

    return (
        <Flex id="name">
            <Input
                value={name}
                disabled={loading}
                onChange={(event) => setName(event.target.value)}
                onKeyPress={onNameKeyPress}
                placeholder="Name of the game"
                size="lg"
            />
            <Button
                variant="solid"
                colorScheme="teal"
                ml="1rem"
                size="lg"
                onClick={searchGame}
                isLoading={loading}
            >
                Add
            </Button>
        </Flex>
    )
}