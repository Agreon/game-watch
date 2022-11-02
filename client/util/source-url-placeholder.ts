import { Country, InfoSourceType, mapCountryCodeToAcceptLanguage } from '@game-watch/shared';

export const SourceUrlPlaceholder = (sourceType: InfoSourceType, userCountry: Country): string => {
    switch (sourceType) {
        case InfoSourceType.Steam:
            return 'https://store.steampowered.com/app/...';
        case InfoSourceType.Metacritic:
            return 'https://www.metacritic.com/game/pc/...';
        case InfoSourceType.Switch:
            switch (userCountry) {
                case 'DE':
                    return 'https://nintendo.de/Spiele/Nintendo-Switch-Download-Software/...';
                case 'US':
                    return 'https://www.nintendo.com/store/products/...';
                case 'AU':
                case 'NZ':
                    return 'https://www.nintendo.com.au/games/nintendo-switch/...';
            }
        case InfoSourceType.Epic:
            const epicAcceptLang = mapCountryCodeToAcceptLanguage(userCountry);
            return `https://www.epicgames.com/store/${epicAcceptLang}/p/...`;
        case InfoSourceType.PsStore:
            const acceptLang = 'de-DE';
            return `https://store.playstation.com/${acceptLang}/product/...`;

    }
};

