import {
    Text,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Alert,
    AlertIcon,
} from "@chakra-ui/react"
import React, { useRef } from "react"
import { LoginUserForm } from "./LoginUserForm";
import { RegisterUserForm } from "./RegisterUserForm";

interface AuthModalProps {
    show: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ show, onClose }) => {
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
    )
}
