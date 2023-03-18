import {
    InfoSourceType,
    MetacriticData,
    ProtonGameData,
    SteamGameData,
    StoreGameData,
} from '@game-watch/shared';
import React from 'react';

import { useInfoSourceContext } from '../../providers/InfoSourceProvider';
import { MetacriticInfoSource } from './MetacriticInfoSource';
import { ProtonDbInfoSource } from './ProtonDbInfoSource';
import { SteamInfoSource } from './SteamInfoSource';
import { StoreInfoSource } from './StoreInfoSource';

export const InfoSource: React.FC = () => {
    const { source } = useInfoSourceContext();

    switch (source.type) {
        case InfoSourceType.Steam:
            return <SteamInfoSource data={source.data as SteamGameData} country={source.country} />;
        case InfoSourceType.Switch:
        case InfoSourceType.Playstation:
        case InfoSourceType.Epic:
            return <StoreInfoSource data={source.data as StoreGameData} country={source.country} />;
        case InfoSourceType.Metacritic:
            return <MetacriticInfoSource data={source.data as MetacriticData} />;
        case InfoSourceType.Proton:
            return <ProtonDbInfoSource data={source.data as ProtonGameData} />;
    }
};
