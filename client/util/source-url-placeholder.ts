import { Country, InfoSourceType, mapCountryCodeToAcceptLanguage } from '@game-watch/shared';

const getSwitchPlaceholder = (userCountry: Country): string => {
    switch (userCountry) {
        case 'AT':
            return 'https://www.nintendo.at/Spiele/Nintendo-Switch-Download-Software/...';
        case 'BE-FR':
            return 'https://www.nintendo.be/fr/Jeux/Jeux-a-telecharger-sur-Nintendo-Switch/...';
        case 'BE-NL':
            return 'https://www.nintendo.be/nl/Games/Nintendo-Switch-download-software/...';
        case 'CH-DE':
            return 'https://www.nintendo.ch/de/Spiele/Nintendo-Switch-Download-Software/...';
        case 'CH-FR':
            return 'https://www.nintendo.ch/fr/Jeux/Jeux-a-telecharger-sur-Nintendo-Switch/...';
        case 'CH-IT':
            return 'https://www.nintendo.ch/it/Giochi/Giochi-scaricabili-per-Nintendo-Switch/...';
        case 'DE':
            return 'https://www.nintendo.de/Spiele/Nintendo-Switch-Download-Software/...';
        case 'ES':
            return 'https://www.nintendo.es/Juegos/Programas-descargables-Nintendo-Switch/...';
        case 'FR':
            return 'https://www.nintendo.fr/Jeux/Jeux-a-telecharger-sur-Nintendo-Switch/...';
        case 'GB':
        case 'IE':
            return 'https://www.nintendo.co.uk/Games/Nintendo-Switch-download-software/...';
        case 'IT':
            return 'https://www.nintendo.it/Giochi/Giochi-scaricabili-per-Nintendo-Switch/...';
        case 'NL':
            return 'https://www.nintendo.nl/Games/Nintendo-Switch-Download-Software/...';
        case 'PT':
            return 'https://www.nintendo.pt/Jogos/Aplicacoes-de-download-da-Nintendo-Switch/...';
        case 'RU':
            return 'https://www.nintendo.ru/-/-Nintendo-Switch/...';
        case 'ZA':
            return 'https://www.nintendo.co.za/Games/Nintendo-Switch-download-software/...';
        case 'US':
            return 'https://www.nintendo.com/store/products/...';
        case 'AU':
        case 'NZ':
            return 'https://www.nintendo.com.au/games/nintendo-switch/...';
    }
};

export const SourceUrlPlaceholder = (sourceType: InfoSourceType, userCountry: Country): string => {
    switch (sourceType) {
        case InfoSourceType.Steam:
            return 'https://store.steampowered.com/app/...';
        case InfoSourceType.Metacritic:
            return 'https://www.metacritic.com/game/pc/...';
        case InfoSourceType.Proton:
            return 'https://www.protondb.com/app/...';
        case InfoSourceType.Switch:
            return getSwitchPlaceholder(userCountry);
        case InfoSourceType.Epic:
            const epicAcceptLang = mapCountryCodeToAcceptLanguage(userCountry);
            return `https://store.epicgames.com/${epicAcceptLang}/p/...`;
        case InfoSourceType.Playstation:
            const acceptLang = mapCountryCodeToAcceptLanguage(userCountry);
            return `https://store.playstation.com/${acceptLang}/product/...`;
        case InfoSourceType.Xbox:
            const xboxAcceptLang = mapCountryCodeToAcceptLanguage(userCountry);
            return `https://www.xbox.com/${xboxAcceptLang}/games/store/...`;
    }
};

