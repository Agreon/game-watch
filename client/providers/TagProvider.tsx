import { CreateTagDto, TagDto } from '@game-watch/shared';
import { AxiosResponse } from 'axios';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useHttp } from '../util/useHttp';
import { useUserContext } from './UserProvider';

export interface TagCtx {
    tags: TagDto[]
    tagsLoading: boolean
    addTag: (name: string) => Promise<TagDto | Error>
}

export const TagContext = React.createContext<TagCtx | null>(null);

export function useTagContext() {
    const context = useContext(TagContext);
    if (!context) {
        throw new Error('TagContext must be used inside TagProvider');
    }

    return context;
}

const TAG_COLORS = [
    'gray',
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'blue',
    'cyan',
    'purple',
    'pink',
    'linkedin',
    'facebook',
    'messenger',
    'whatsapp',
    'twitter',
    'telegram',
];

export const TagProvider: React.FC<{
    children: React.ReactChild,
}> = ({ children }) => {
    const { user } = useUserContext();
    const [tagsLoading, setTagsLoading] = useState(false);
    const [tags, setTags] = useState<TagDto[]>([]);
    const { requestWithErrorHandling: requestWithErrorHandling } = useHttp();

    const fetchTags = useCallback(async () => {
        setTagsLoading(true);
        await requestWithErrorHandling(async http => {
            const { data } = await http.get('/tag');
            setTags(data);
        });
        setTagsLoading(false);
    }, [requestWithErrorHandling]);

    const getAvailableRandomTagColor = useCallback(() => {
        const usedColors = tags.map(tag => tag.color);
        const availableColors = TAG_COLORS.filter(color => !usedColors.includes(color));
        // Just reuse colors if none are available anymore.
        const colorsToSelectFrom = availableColors.length === 0 ? TAG_COLORS : availableColors;
        const randomIndex = Math.floor(Math.random() * colorsToSelectFrom.length);

        return colorsToSelectFrom[randomIndex];
    }, [tags]);

    const addTag = useCallback(async (name: string) => {
        const color = getAvailableRandomTagColor();

        return await requestWithErrorHandling(async http => {
            const { data } = await http.post<CreateTagDto, AxiosResponse<TagDto>>(
                '/tag',
                { name, color }
            );

            setTags(tags => [
                data,
                ...tags,
            ]);

            return data;
        });
    }, [requestWithErrorHandling, getAvailableRandomTagColor]);

    useEffect(() => { fetchTags(); }, [fetchTags, user.id]);

    const contextValue = useMemo(() => ({
        tags,
        tagsLoading,
        addTag
    }), [tags, tagsLoading, addTag]);

    return (
        <TagContext.Provider value={contextValue}>
            {children}
        </TagContext.Provider>
    );
};
