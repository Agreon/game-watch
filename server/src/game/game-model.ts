import { BaseEntity, Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';

import { InfoSource } from "../info-source/info-source-model";

@Entity()
export class Game extends BaseEntity<Game, "id"> {
    @PrimaryKey()
    public id: string = v4();

    @Property()
    public createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    public updatedAt: Date = new Date();

    @Property()
    public search!: string;

    @Property({ type: "string", nullable: true })
    public name: string | null;

    @Property()
    public description: string = "";

    @OneToMany(() => InfoSource, infoSource => infoSource.game)
    public infoSources = new Collection<InfoSource, Game>(this);

    public constructor({ search }: { search: string }) {
        super();
        this.search = search;
    }
}