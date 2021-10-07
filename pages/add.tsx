import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Flex } from "@chakra-ui/layout";
import { Switch } from "@chakra-ui/switch";
import { Textarea } from "@chakra-ui/textarea";
import { NextPage } from "next";
import React, { useState, useCallback } from "react";
import { Text } from "@chakra-ui/react"
import axios from "axios";

const AddPage: NextPage = () => {
    const [name, setName] = useState("");
    const [sources, setSources] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(false);

    // Don't trigger create twice => Or just make create call idempotent
    const fetchSources = useCallback(async () => {
        setLoading(true);

        try {
            const { data } = await axios.post<unknown>("http://localhost:3001/game", { name });

            console.log(data);

            setSources(data as string[]);
        } catch (e) {

        } finally {
            setLoading(false);
        }
    }, [name])

    const onNameBlur = useCallback(async () => {
        if (!loading && name.trim() !== "") {
            await fetchSources();
        }
    }, [name, loading, fetchSources]);

    const onNameKeyPress = useCallback(async ({ key }) => {
        if (!loading && key === "Enter") {
            console.log("ENTER");
            await fetchSources();
        }
    }, [loading, fetchSources]);

    return (
        <Flex justify="center" >
            <div style={{ maxWidth: "600px", width: "100%" }}>
                <span>Add</span>
                <FormControl id="name">
                    <FormLabel>Name</FormLabel>
                    <Input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        onKeyPress={onNameKeyPress}
                        placeholder="Name of the game"
                        size="lg"
                        onBlur={onNameBlur}
                    />
                </FormControl>
                <FormControl>
                    <Textarea placeholder="More information" />
                </FormControl>

                <Flex flexDirection="column">
                    InfoSources
                    {(sources ?? []).map(source => (
                        <Flex key={source}>
                            {source}
                        </Flex>
                    ))}
                </Flex>
                <FormControl display="flex" mt="12" alignItems="center" justifyContent="space-between">
                    <FormLabel htmlFor="email-alerts" mb="0">
                        <Text fontSize="lg">Continously search for new store listings / information sources</Text>
                    </FormLabel>
                    <Switch id="email-alerts" size="lg" />
                </FormControl>
                <Flex justify="flex-end" mt="12">
                    <Button variant="solid" colorScheme="teal">
                        Submit
                    </Button>
                </Flex>
            </div>
        </Flex>
    )
}

export default AddPage;