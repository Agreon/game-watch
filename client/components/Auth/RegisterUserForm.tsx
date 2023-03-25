import {
    Box,
    Button,
    chakra,
    Checkbox,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Link,
    Text,
    useToast,
} from '@chakra-ui/react';
import { RegisterUserDto } from '@game-watch/shared';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';

import { useUserContext } from '../../providers/UserProvider';
import { DEFAULT_TOAST_OPTIONS } from '../../util/default-toast-options';
import { useAction } from '../../util/useAction';

const Form = chakra('form');

export const RegisterUserForm: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const toast = useToast(DEFAULT_TOAST_OPTIONS);
    const { registerUser, user } = useUserContext();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        watch,
    } = useForm<RegisterUserDto>({
        resolver: classValidatorResolver(RegisterUserDto),
        defaultValues: { id: user.id }
    });

    const enableEmailNotifications = watch('enableEmailNotifications', false);

    const { loading, execute: onRegister } = useAction(registerUser, {
        onError: error => {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                return setError('username', { type: 'validate' });
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
            <Text mt="0.25rem">Don&apos;t worry about your data {';)'}</Text>

            <Form mt="1rem" onSubmit={handleSubmit(onRegister)} >
                <FormControl variant="floating" isInvalid={!!errors.username}>
                    <Input id="username" placeholder="" {...register('username', { required: true })} />
                    <FormLabel htmlFor="username">Username</FormLabel>
                    {errors.username?.type === 'isLength'
                        && <FormErrorMessage>A username is required</FormErrorMessage>}
                    {errors.username?.type === 'validate'
                        && <FormErrorMessage>Username is already taken</FormErrorMessage>}
                </FormControl>

                <FormControl variant="floating" mt="1rem" isInvalid={!!errors.password}>
                    <Input id="password" type="password" placeholder="" {...register('password', { required: true })} />
                    <FormLabel>Password</FormLabel>
                    {errors.password
                        && <FormErrorMessage>{errors.password.message}</FormErrorMessage>}
                </FormControl>

                <FormControl mt="1rem">
                    <Checkbox
                        id="enableEmailNotifications"
                        {...register('enableEmailNotifications', { value: false })}
                    >
                        <Text mt="0.3rem">
                            Enable E-Mail Notifications
                        </Text>
                    </Checkbox>
                </FormControl>

                {
                    enableEmailNotifications &&
                    <FormControl variant="floating" mt="1rem" isInvalid={!!errors.email}>
                        <Input id="email" type="email" placeholder="" {...register('email')} />
                        <FormLabel>Email</FormLabel>
                        {errors.email
                            && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
                    </FormControl>
                }

                <FormControl mt="1rem" isInvalid={!!errors.agreeToTermsOfService}>
                    <Flex alignItems="start">
                        <Checkbox
                            id="agreeToTermsOfService"
                            {...register('agreeToTermsOfService')}
                        />
                        <Box width="100%" mt="-0.1rem">
                            <Text ml="0.5rem">
                                I agree with the{' '}
                                <Link
                                    href="/privacy-policy"
                                    target="_blank"
                                    fontWeight="bold"
                                >
                                    Privacy Policy
                                </Link>
                                {' '}and the{' '}
                                <Link
                                    href="/tos"
                                    target="_blank"
                                    fontWeight="bold"
                                >
                                    Terms of Service
                                </Link>
                            </Text>
                        </Box>
                    </Flex>
                    {errors.agreeToTermsOfService
                        && <FormErrorMessage>
                            {errors.agreeToTermsOfService.message}
                        </FormErrorMessage>
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
                        Register
                    </Button>
                </Flex>
            </Form >
        </Box >
    );
};
