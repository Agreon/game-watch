import {
    Box,
    Button,
    chakra,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Text,
    useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';

import { useUserContext } from '../../providers/UserProvider';
import { DEFAULT_TOAST_OPTIONS } from '../../util/default-toast-options';
import { useAction } from '../../util/useAction';

type Inputs = {
    username: string,
    password: string,
}

const Form = chakra('form');

export const LoginUserForm: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const toast = useToast(DEFAULT_TOAST_OPTIONS);
    const { loginUser } = useUserContext();
    const { register, handleSubmit, formState: { errors }, setError } = useForm<Inputs>();

    const { loading, execute: onLogin } = useAction(loginUser, {
        onError: error => {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                return setError('password', { type: 'validate' });
            }

            toast({
                title: 'Error',
                description: 'Unexpected Error. Please try again.',
                status: 'error',
            });
        }
    });

    return (
        <Box>
            <Text mt="0.25rem">Welcome back!</Text>

            <Form mt="1rem" onSubmit={handleSubmit(onLogin)} >
                <FormControl variant="floating" isInvalid={!!errors.username}>
                    <Input
                        id="username"
                        placeholder=""
                        {...register('username', { required: true })}
                    />
                    <FormLabel htmlFor="username">Username</FormLabel>
                    {errors.username && <FormErrorMessage>This field is required</FormErrorMessage>}
                </FormControl>

                <FormControl variant="floating" mt="1rem" isInvalid={!!errors.password}>
                    <Input
                        id="password"
                        type="password"
                        placeholder=""
                        {...register('password', { required: true })}
                    />
                    <FormLabel>Password</FormLabel>
                    {errors.password?.type === 'required' &&
                        <FormErrorMessage>This field is required</FormErrorMessage>
                    }
                    {errors.password?.type === 'validate' &&
                        <FormErrorMessage>Wrong username or password</FormErrorMessage>
                    }
                </FormControl>

                <Flex justify="end" mt="2rem">
                    <Button onClick={onCancel} mr="1rem">Cancel</Button>
                    <Button
                        colorScheme='teal'
                        type="submit"
                        isLoading={loading}
                        disabled={loading}
                    >
                        Login
                    </Button>
                </Flex>
            </Form>
        </Box>
    );
};
