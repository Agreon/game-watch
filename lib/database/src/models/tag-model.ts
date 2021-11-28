import { Collection, Entity, ManyToMany, Property } from "@mikro-orm/core";

import { BaseEntity } from "../base-entity";
import { Game } from "./game-model";

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
