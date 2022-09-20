import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text
} from '@chakra-ui/react';
import { Country, InfoSourceType, SupportedCountries, UserState } from '@game-watch/shared';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { INFO_SOURCE_PRIORITY } from '../../providers/GameProvider';
import { useUserContext } from '../../providers/UserProvider';
import { ModalProps } from '../../util/types';
import { useAction } from '../../util/useAction';
import { InfoSourceFilter } from '../InfoSourceFilter';
import { CountrySelect } from './CountrySelect';

export const ConfigureUserSettingsModal: React.FC<ModalProps> = ({ show, onClose }) => {
    const initialRef = useRef(null);
    const { user, updateUserSettings } = useUserContext();
    const {
        loading,
        execute: updateSettings
    } = useAction(updateUserSettings, { onSuccess: onClose });

    const [
        enableEmailNotifications,
        setEnableEmailNotifications
    ] = useState(user.enableEmailNotifications);
    const [email, setEmail] = useState(user.email ?? '');
    const [
        interestedInSources,
        setInterestedInSources
    ] = useState<InfoSourceType[]>(user.interestedInSources);
    const [country, setUserCountry] = useState<Country>(user.country);

    // Necessary if the user just registered.
    useEffect(() => {
        setEnableEmailNotifications(user.enableEmailNotifications);
        setEmail(user.email ?? '');
    }, [user]);

    const availableInfoSources = useMemo(() => INFO_SOURCE_PRIORITY.filter(
        type => SupportedCountries[type].includes(country)
    ), [country]);

    const onUpdateUserSettings = useCallback(async () => {
        await updateSettings({
            enableEmailNotifications,
            // An empty string would trigger the validation.
            email: email || null,
            country,
            interestedInSources,
        });
    }, [updateSettings, country, interestedInSources, enableEmailNotifications, email]);

    return (
        <Modal
            initialFocusRef={initialRef}
            onClose={onClose}
            isOpen={show}
            size="3xl"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    Settings
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb="1rem">
                    {user.state !== UserState.Trial &&
                        <>
                            <FormControl mt="1rem">
                                <Checkbox
                                    isChecked={enableEmailNotifications}
                                    onChange={e => setEnableEmailNotifications(e.target.checked)}
                                >
                                    Enable E-Mail Notifications
                                </Checkbox>
                            </FormControl>
                            {
                                enableEmailNotifications &&
                                <FormControl variant="floating" mt="2rem" isInvalid={!email}>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                    <FormLabel>Email</FormLabel>
                                    {!email
                                        && <FormErrorMessage>
                                            This field is required
                                        </FormErrorMessage>
                                    }
                                </FormControl>
                            }
                        </>
                    }
                    <Flex
                        align={['start', 'center']}
                        direction={['column', 'row']}
                        mt={['1rem', '1rem', '2rem']}
                        mb="1rem"
                    >
                        <Text fontSize={['l', 'l', 'xl']}>
                            Available sources for
                        </Text>
                        <Box ml={[0, '1rem']} mt={['1rem', 0]} minWidth="10rem">
                            <CountrySelect
                                value={country}
                                onChange={setUserCountry}
                            />
                        </Box>
                    </Flex>
                    <InfoSourceFilter
                        availableInfoSources={availableInfoSources}
                        filterInfoSources={interestedInSources}
                        setFilterInfoSources={setInterestedInSources}
                    />
                    <Text mt="1rem">
                        Missing a source? Let me know or contribute on
                        <Link href="https://github.com/agreon/game-watch" isExternal ml="0.5rem">
                            <Text as="u">GitHub<ExternalLinkIcon ml='0.2rem' mb="0.2rem" /></Text>
                        </Link>
                    </Text>
                    <Flex justify="flex-end" width="100%" mt="2rem">
                        <Button size="lg" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            ml="1rem"
                            size="lg"
                            colorScheme="teal"
                            type="submit"
                            isLoading={loading}
                            disabled={
                                loading
                                || (
                                    user.state !== UserState.Trial
                                    && enableEmailNotifications
                                    && !email
                                )
                            }
                            onClick={onUpdateUserSettings}
                        >
                            Save
                        </Button>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
