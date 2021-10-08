import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { useState, useCallback } from "react";
import { useGameContext } from "../providers/GameProvider";

export const AddGame: React.FC = () => {
    const { addGame } = useGameContext();
    const [name, setName] = useState("");

    const onNameKeyPress = useCallback(async ({ key }) => {
        if (key === "Enter") {
            await addGame(name);
            setName("");
        }
    }, [addGame, name, setName]);

    return (
        <FormControl id="name">
            <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyPress={onNameKeyPress}
                placeholder="Name of the game"
                size="lg"
            />
        </FormControl>
    )
}