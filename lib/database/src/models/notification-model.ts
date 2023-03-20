import { NotificationData, NotificationType } from '@game-watch/shared';
import {
    Entity,
    Enum,
    IdentifiedReference,
    Index,
    ManyToOne,
    Property,
    Reference,
} from '@mikro-orm/core';

import { BaseEntity } from '../base-entity';
import { Game } from './game-model';
import { InfoSource } from './info-source-model';
import { User } from './user-model';

@Entity()
export class Notification<T extends NotificationType = NotificationType>
    extends BaseEntity<Notification<T>>
{
    @Enum({ items: () => NotificationType, type: 'string' })
    public type!: T;

    @Property()
    @Index()
    public read: boolean = false;

    @ManyToOne(() => Game, { wrappedReference: true, onDelete: 'cascade' })
    public game!: IdentifiedReference<Game>;

    @ManyToOne(() => InfoSource, { wrappedReference: true, onDelete: 'cascade' })
    public infoSource!: IdentifiedReference<InfoSource>;

    @Property({ columnType: 'json' })
    public data!: NotificationData[T];

    @ManyToOne(() => User, { wrappedReference: true, onDelete: 'cascade' })
    public user!: IdentifiedReference<User>;

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
