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
    Text,
    useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";

import { useUserContext } from "../../providers/UserProvider";
import { useAction } from "../../util/useAction";

type Inputs = {
    username: string,
    password: string,
}

const Form = chakra("form");

export const RegisterUserForm: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const toast = useToast();
    const { registerUser } = useUserContext();
    const { register, handleSubmit, formState: { errors }, setError } = useForm<Inputs>();

    const { loading, execute: onRegister } = useAction(registerUser, {
        onError: error => {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                return setError("username", { type: "validate" });
            }

            toast({
                title: "Error",
                description: "Unexpected Error. Please try again.",
                status: "error",
                position: "top-right",
            });
        }
    });

    return (
        <Box>
            <Text mt="0.25rem">Dont worry about your data</Text>

            <Form mt="1rem" onSubmit={handleSubmit(onRegister)} >
                <FormControl variant="floating" isInvalid={!!errors.username}>
                    <Input id="username" placeholder=" " {...register("username", { required: true })} />
                    <FormLabel htmlFor="username">Username</FormLabel>
                    {errors.username?.type === "required" && <FormErrorMessage>This field is required</FormErrorMessage>}
                    {errors.username?.type === "validate" && <FormErrorMessage>Username is already taken</FormErrorMessage>}
                </FormControl>

                <FormControl variant="floating" mt="1rem" isInvalid={!!errors.password}>
                    <Input id="password" type="password" placeholder=" " {...register("password", { required: true })} />
                    <FormLabel>Password</FormLabel>
                    {errors.password && <FormErrorMessage>This field is required</FormErrorMessage>}
                </FormControl>

                <FormControl mt="1.5rem">
                    <Checkbox>I agree with everything</Checkbox>
                </FormControl>

                <Flex justify="end" mt="2rem">
                    <Button onClick={onCancel} mr="1rem">Cancel</Button>
                    <Button colorScheme='teal' type="submit" isLoading={loading} disabled={loading} >
                        Register
                    </Button>
                </Flex>
            </Form>
        </Box>
    );
};
