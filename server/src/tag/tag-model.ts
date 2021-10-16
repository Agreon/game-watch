import { Collection, Entity, ManyToMany, Property } from "@mikro-orm/core";

import { Game } from "../game/game-model";
import { BaseEntity } from "../util/base-entity";

@Entity()
export class Tag extends BaseEntity<Tag> {
    @Property()
    public name!: string;

    @Property()
    public color!: string;

    @ManyToMany(() => Game, game => game.tags)
    public games = new Collection<Game>(this);

    public constructor({ name, color }: { name: string, color: string }) {
        super();
        this.name = name;
        this.color = color;
    }
}
