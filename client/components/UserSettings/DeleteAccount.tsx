import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    useDisclosure,
} from '@chakra-ui/react';
import React, { useCallback, useRef } from 'react';

import { useUserContext } from '../../providers/UserProvider';
import { useAction } from '../../util/useAction';

export const DeleteAccount: React.FC = () => {
    const initialRef = useRef(null);
    const { logoutUser, deleteUser } = useUserContext();

    const {
        isOpen: showAlert,
        onOpen: openAlert,
        onClose: closeAlert,
    } = useDisclosure();

    const {
        loading: loadingDelete,
        execute: deleteAccount
    } = useAction(deleteUser);

    const onAccountDelete = useCallback(async () => {
        await deleteAccount();
        await logoutUser();
    }, [logoutUser, deleteAccount]);

    return (
        <>
            <Button colorScheme='red' onClick={openAlert}>
                Delete Account
            </Button>
            <AlertDialog
                isOpen={showAlert}
                onClose={closeAlert}
                leastDestructiveRef={initialRef}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete Account
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {'Are you sure you want to delete your account?'}
                            {" This action can't be undone."}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={initialRef} onClick={closeAlert}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme='red'
                                isLoading={loadingDelete}
                                disabled={loadingDelete}
                                onClick={onAccountDelete}
                                ml={3}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};
