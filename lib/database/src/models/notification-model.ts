import { NotificationData, NotificationType } from '@game-watch/shared';
import {
    Entity,
    Enum,
    Index,
    ManyToOne,
    Property,
    Ref,
    Reference,
} from '@mikro-orm/core';

import { BaseEntity } from '../base-entity';
import { Game } from './game-model';
import { InfoSource } from './info-source-model';
import { User } from './user-model';

@Entity()
export class Notification<T extends NotificationType = NotificationType>
    extends BaseEntity {
    @Enum({ items: () => NotificationType, type: 'string' })
    public type!: T;

    @Property()
    @Index()
    public read: boolean = false;

    @ManyToOne(() => Game, { ref: true, deleteRule: 'cascade' })
    public game!: Ref<Game>;

    @ManyToOne(() => InfoSource, { ref: true, deleteRule: 'cascade' })
    @Index()
    public infoSource!: Ref<InfoSource>;

    @Property({ columnType: 'jsonb' })
    public data!: NotificationData[T];

    @ManyToOne(() => User, { ref: true, deleteRule: 'cascade' })
    public user!: Ref<User>;

    public constructor(
        { type, data, game, infoSource }: {
            type: T;
            data: NotificationData[T];
            game: Game;
            infoSource: InfoSource;
        },

    ) {
        super();
        this.type = type;
        this.data = data;
        this.game = Reference.create(game);
        this.infoSource = Reference.create(infoSource);
        this.user = game.user;
    }
}
