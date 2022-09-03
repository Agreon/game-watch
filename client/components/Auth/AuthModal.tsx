import {
    Alert,
    AlertIcon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import React, { useRef } from "react";

import { ModalProps } from "../../util/types";
import { LoginUserForm } from "./LoginUserForm";
import { RegisterUserForm } from "./RegisterUserForm";

export const AuthModal: React.FC<ModalProps> = ({ show, onClose }) => {
    const initialRef = useRef(null);

    return (
        <Modal
            initialFocusRef={initialRef}
            onClose={onClose}
            isOpen={show}
            size="md"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    Authenticate
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb="1rem">
                    <Alert status='warning' mb="1rem">
                        <AlertIcon />
                        <Text>Any unsaved data will be lost, if your browser cache is cleared!</Text>
                    </Alert>
                    <Tabs isFitted>
                        <TabList>
                            <Tab _focus={{ boxShadow: "none" }}>Register</Tab>
                            <Tab _focus={{ boxShadow: "none" }}>Login</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <RegisterUserForm onCancel={onClose} />
                            </TabPanel>
                            <TabPanel>
                                <LoginUserForm onCancel={onClose} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
