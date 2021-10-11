import { Box, Flex } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import {
    Select,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
} from "@chakra-ui/react";
import { Game, InfoSourceType, useGameContext } from "../../providers/GameProvider";
import React, { useCallback, useMemo, useRef, useState } from "react";

const extractRemoteGameId = (type: InfoSourceType, storeUrl: string) => {
    switch (type) {
        case InfoSourceType.Steam:
            const parts = storeUrl.split("/");
            return parts[parts.length - 3];
        case InfoSourceType.Nintendo:
        case InfoSourceType.PsStore:
        default:
            return storeUrl
    }
}

export const AddInfoSource: React.FC<{ game: Game }> = ({ game }) => {
    const { addInfoSource, syncInfoSource } = useGameContext();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const initialRef = useRef(null);

    const availableInfoSources = useMemo(
        () => Object.values(InfoSourceType)
            .filter(type =>
                !game.infoSources
                    .filter(source => !source.disabled)
                    .map(source => source.type)
                    .includes(type)
            ),
        [game.infoSources]
    );

    const [type, setType] = useState(availableInfoSources[0]);
    const [storeUrl, setStoreUrl] = useState("");

    const onAddInfoSource = useCallback(async () => {
        try {
            const remoteGameId = extractRemoteGameId(type, storeUrl);

            const infoSource = await addInfoSource(game, type, remoteGameId);
            onClose();
            setStoreUrl("");

            await syncInfoSource(game, infoSource);
        } catch (error) {
            console.error(error);
        }
    }, [addInfoSource, syncInfoSource, onClose, game, type, storeUrl]);

    return (
        <>
            <Modal
                size="xl"
                isOpen={isOpen}
                onClose={onClose}
                initialFocusRef={initialRef}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add new InfoSource</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Flex>
                            <FormControl flex="0.5" mr="1rem">
                                <FormLabel>Type</FormLabel>
                                <Select onChange={event => setType(event.target.value as InfoSourceType)}>
                                    {availableInfoSources.map(source => (
                                        <option key={source} value={source}>{source}</option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl flex="1">
                                <FormLabel>Store url</FormLabel>
                                <Input
                                    value={storeUrl}
                                    onChange={event => setStoreUrl(event.target.value)}
                                    ref={initialRef} />
                            </FormControl>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose} mr="1rem">Cancel</Button>
                        <Button colorScheme="teal" onClick={onAddInfoSource} >
                            Add
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {availableInfoSources.length > 0 &&
                <Flex justify="center">
                    <Button onClick={onOpen}>
                        +
                    </Button>
                </Flex>
            }
        </>
    );
}