import { Collection, Entity, ManyToMany, OneToMany, Property } from "@mikro-orm/core";

import { BaseEntity } from "../base-entity";
import { InfoSource } from "./info-source-model";
import { Tag } from "./tag-model";

@Entity()
export class Game extends BaseEntity<Game> {
    @Property()
    public search!: string;

    @Property({ type: "string", nullable: true })
    public name: string | null;

    @Property()
    public syncing: boolean = true;

    @Property()
    public description: string = "";

    @OneToMany(() => InfoSource, infoSource => infoSource.game)
    public infoSources = new Collection<InfoSource, Game>(this);

    @ManyToMany(() => Tag)
    public tags = new Collection<Tag, Game>(this);

    public constructor({ search }: { search: string }) {
        super();
        this.search = search;
    }
}