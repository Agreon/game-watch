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
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useGameContext } from "../../providers/GameProvider";
import { InfoSourceDto, InfoSourceType } from "game-watch-shared";

export const AddInfoSource: React.FC<{ syncInfoSource: (infoSource: InfoSourceDto) => Promise<void> }> = ({ syncInfoSource }) => {
    const { addInfoSource, allInfoSources } = useGameContext();
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const initialRef = useRef(null);

    const availableInfoSources = useMemo(
        () => Object.values(InfoSourceType)
            .filter(type =>
                !allInfoSources
                    .filter(source => !source.disabled)
                    .map(source => source.type)
                    .includes(type)
            ),
        [allInfoSources]
    );

    const [type, setType] = useState(availableInfoSources[0]);
    const [url, setUrl] = useState("");

    const onAddInfoSource = useCallback(async () => {
        setLoading(true);
        const infoSource = await addInfoSource(type, url);
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