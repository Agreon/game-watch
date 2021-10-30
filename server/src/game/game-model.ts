import { Collection, Entity, Filter, IdentifiedReference, ManyToMany, ManyToOne, OneToMany, Property, wrap } from "@mikro-orm/core";

import { User } from "../auth/user-model";
import { InfoSource } from "../info-source/info-source-model";
import { Tag } from "../tag/tag-model";
import { BaseEntity } from "../util/base-entity";

@Entity()
// @Filter<Game>({name: "tags", cond: (tagIds: string[]) => ({tags}), args: [{}]})
export class Game extends BaseEntity<Game> {
    @Property()
    public search!: string;

    @Property({ type: "string", nullable: true })
    public name: string | null;

    @Property()
    public description: string = "";

    @OneToMany(() => InfoSource, infoSource => infoSource.game)
    public infoSources = new Collection<InfoSource, Game>(this);

    @ManyToMany(() => Tag)
    public tags = new Collection<Tag, Game>(this);

    @ManyToOne(() => User, { wrappedReference: true })
    public user!: IdentifiedReference<User>;

    public constructor({ search, user }: { search: string, user: User }) {
        super();
        this.search = search;
        this.user = wrap(user).toReference();
    }
}