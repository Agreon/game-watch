import { InfoSourceType, MetacriticData, StoreGameData } from '@game-watch/shared';
import React from 'react';

import { useInfoSourceContext } from '../../providers/InfoSourceProvider';
import { MetacriticInfoSource } from './MetacriticInfoSource';
import { StoreInfoSource } from './StoreInfoSource';

export const InfoSource: React.FC = () => {
    const { source } = useInfoSourceContext();

    switch (source.type) {
        case InfoSourceType.Steam:
        case InfoSourceType.Switch:
        case InfoSourceType.PsStore:
        case InfoSourceType.Epic:
            return <StoreInfoSource data={source.data as StoreGameData} />;
        case InfoSourceType.Metacritic:
            return <MetacriticInfoSource data={source.data as MetacriticData} />;
    }
};
