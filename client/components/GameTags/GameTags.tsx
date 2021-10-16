import React, { useCallback, useState } from "react";
import { Game, useGameContext } from "../../providers/GameProvider";
import { useTagContext } from "../../providers/TagProvider";
import { AddTagToGame } from "./AddTagToGame";
import { EditGameTags } from "./EditGameTags";
import { GameTagList } from "./GameTagList";

enum EditMode {
    None,
    Edit,
    Add
}

export const GameTags: React.FC<{ game: Game }> = ({ game }) => {
    const [editMode, setEditMode] = useState(EditMode.None);
    const { addTag } = useTagContext();
    const { addTagToGame } = useGameContext();

    const onAdd = useCallback(async (name: string) => {
        try {
            const tag = await addTag(name);
            await addTagToGame(game, tag);
        } finally {
            setEditMode(EditMode.None);
        }
    }, [addTag, addTagToGame, game]);

    switch (editMode) {
        case EditMode.None:
            return <GameTagList game={game} onEdit={() => setEditMode(EditMode.Edit)} />
        case EditMode.Edit:
            return <EditGameTags game={game} onNewTag={() => setEditMode(EditMode.Add)} onCancel={() => setEditMode(EditMode.None)} />
        case EditMode.Add:
            return <AddTagToGame onSubmit={onAdd} onAbort={() => setEditMode(EditMode.Edit)} />
    }
}