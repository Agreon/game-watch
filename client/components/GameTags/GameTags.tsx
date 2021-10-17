import React, { useCallback, useState } from "react";
import { useGameContext } from "../../providers/GameProvider";
import { useTagContext } from "../../providers/TagProvider";
import { AddTagToGame } from "./AddTagToGame";
import { EditGameTags } from "./EditGameTags";
import { GameTagList } from "./GameTagList";

enum EditMode {
    None,
    Edit,
    Add
}

export const GameTags: React.FC = () => {
    const [editMode, setEditMode] = useState(EditMode.None);
    const { addTag } = useTagContext();
    const { addTagToGame } = useGameContext();

    const onAdd = useCallback(async (name: string) => {
        try {
            const tag = await addTag(name);
            await addTagToGame(tag);
        } finally {
            setEditMode(EditMode.None);
        }
    }, [addTag, addTagToGame]);

    switch (editMode) {
        case EditMode.None:
            return <GameTagList onEdit={() => setEditMode(EditMode.Edit)} />
        case EditMode.Edit:
            return <EditGameTags onNewTag={() => setEditMode(EditMode.Add)} onCancel={() => setEditMode(EditMode.None)} />
        case EditMode.Add:
            return <AddTagToGame onSubmit={onAdd} onAbort={() => setEditMode(EditMode.Edit)} />
    }
}