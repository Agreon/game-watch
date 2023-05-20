import { cleanupGameName } from './cleanup-game-name';

const IGNORED_TOKENS = [
    'a',
    'the',
    'of'
];

// TODO: May be too conservative?
export const matchingName = (name: string, search: string) => {
    const nameTokens = cleanupGameName(name)
        .split(' ')
        .filter(value => !!value);

    const searchTokens = search
        .replace(/\d/, '')
        .toLowerCase()
        .split(' ')
        .filter(value => !!value && !IGNORED_TOKENS.includes(value.trim()));

    return searchTokens.some(searchToken =>
        nameTokens.some(nameToken => nameToken.includes(searchToken.trim()))
    );
};
