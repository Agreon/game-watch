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
import React, { useRef, useState } from "react";
import { useGameContext } from "../../providers/GameProvider";
import { InfoSourceType } from "@game-watch/shared";
import { useAction } from "../../util/useAction";
import { PlaceholderMap } from "../AddGameModal";

export const AddInfoSource: React.FC = () => {
    const { availableInfoSources, addInfoSource } = useGameContext();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [type, setType] = useState(availableInfoSources[0]);
    const [url, setUrl] = useState("");

    const initialRef = useRef(null);

    const { loading, execute: onAdd } = useAction(addInfoSource, {
        onSuccess: () => {
            onClose();
            setUrl("");
        }
    })

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
                                    disabled={loading}
                                    placeholder={PlaceholderMap[type]}
                                    onChange={event => setUrl(event.target.value)}
                                    ref={initialRef} />
                            </FormControl>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose} mr="1rem">Cancel</Button>
                        <Button loading={loading} colorScheme="teal" onClick={() => onAdd({ type, url })} >
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