import { AxiosResponse } from "axios";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../util/http";
import { Tag } from "./GameProvider";

export interface TagCtx {
    tags: Tag[]
    tagsLoading: boolean
    addTag: (name: string) => Promise<Tag>
}

export const TagContext = React.createContext<TagCtx>({
    tags: [],
    tagsLoading: false,
    addTag: async () => ({} as Tag),
});

export function useTagContext() {
    return useContext<TagCtx>(TagContext);
}

const TAG_COLORS = ["gray", "red", "orange", "yellow", "green", "teal", "blue", "cyan", "purple", "pink", "linkedin", "facebook", "messenger", "whatsapp", "twitter", "telegram"];

export const TagProvider: React.FC = ({ children }) => {
    const [tagsLoading, setTagsLoading] = useState(false);
    const [tags, setTags] = useState<Tag[]>([]);

    const fetchTags = useCallback(async () => {
        setTagsLoading(true);
        try {
            const { data } = await http.get('/tag');
            setTags(data);
        } finally {
            setTagsLoading(false);
        }
    }, []);

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

        const { data } = await http.post<unknown, AxiosResponse<Tag>>("/tag", { name, color });

        setTags(tags => [
            data,
            ...tags,
        ]);

        return data;
    }, [getAvailableRandomTagColor]);

    useEffect(() => { fetchTags() }, [fetchTags]);

    const contextValue = useMemo(() => ({
        tags,
        tagsLoading,
        addTag
    }), [tags, tagsLoading, addTag]);

    return (
        <TagContext.Provider value={contextValue}>
            {children}
        </TagContext.Provider>
    )
}