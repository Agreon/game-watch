import { Flex } from "@chakra-ui/layout";
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
import { InfoSourceType } from "../../providers/GamesProvider";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useInfoSourceContext } from "../../providers/InfoSourceProvider";
import { useGameContext } from "../../providers/GameProvider";

const extractRemoteGameId = (type: InfoSourceType, url: string) => {
    switch (type) {
        case InfoSourceType.Steam:
            const parts = url.split("/");
            return parts[parts.length - 3];
        case InfoSourceType.Switch:
            // https://www.nintendo.de/Spiele/Nintendo-Switch/Bayonetta-3-2045649.html
            // => Extracts Last part without stuff behind last-
            const urlParts = url.split("/");
            const idPart = urlParts[urlParts.length - 1];
            const idParts = idPart.split("-").slice(0, -1);

            return idParts.join(" ");
        case InfoSourceType.PsStore:
        case InfoSourceType.Metacritic:
        default:
            return url
    }
}

export const AddInfoSource: React.FC = () => {
    const { addInfoSource } = useGameContext();
    const { syncInfoSource, infoSources } = useInfoSourceContext();
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const initialRef = useRef(null);

    const availableInfoSources = useMemo(
        () => Object.values(InfoSourceType)
            .filter(type =>
                !infoSources
                    .filter(source => !source.disabled)
                    .map(source => source.type)
                    .includes(type)
            ),
        [infoSources]
    );

    const [type, setType] = useState(availableInfoSources[0]);
    const [url, setUrl] = useState("");

    const onAddInfoSource = useCallback(async () => {
        setLoading(true);
        const remoteGameId = extractRemoteGameId(type, url);

        const infoSource = await addInfoSource(type, remoteGameId);
        if (!infoSource) {
            return;
        }

        setLoading(false);
        onClose();
        setUrl("");

        await syncInfoSource(infoSource);
    }, [addInfoSource, syncInfoSource, onClose, type, url]);

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
                                <FormLabel>Url</FormLabel>
                                <Input
                                    value={url}
                                    onChange={event => setUrl(event.target.value)}
                                    ref={initialRef} />
                            </FormControl>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose} mr="1rem">Cancel</Button>
                        <Button loading={loading} colorScheme="teal" onClick={onAddInfoSource} >
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