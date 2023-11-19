import {
    InfoSourceType,
    MetacriticData,
    PlaystationGameData,
    ProtonGameData,
    StoreGameData,
} from '@game-watch/shared';
import React from 'react';

import { useInfoSourceContext } from '../../providers/InfoSourceProvider';
import { MetacriticInfoSource } from './MetacriticInfoSource';
import { PlaystationInfoSource } from './PlaystationInfoSource';
import { ProtonDbInfoSource } from './ProtonDbInfoSource';
import { StoreInfoSource } from './StoreInfoSource';

export const InfoSource: React.FC = () => {
    const { source } = useInfoSourceContext();

    switch (source.type) {
        case InfoSourceType.Steam:
        case InfoSourceType.Switch:
        case InfoSourceType.Xbox:
        case InfoSourceType.Epic:
            return <StoreInfoSource data={source.data as StoreGameData} country={source.country} />;
        case InfoSourceType.Playstation:
            return <PlaystationInfoSource data={source.data as PlaystationGameData} country={source.country} />;
        case InfoSourceType.Metacritic:
            return <MetacriticInfoSource data={source.data as MetacriticData} />;
        case InfoSourceType.Proton:
            return <ProtonDbInfoSource data={source.data as ProtonGameData} />;
    }
};
