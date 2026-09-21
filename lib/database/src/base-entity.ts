import { randomUUID } from 'node:crypto';

import { BaseEntity as MikroOrmBaseEntity, PrimaryKey, Property } from '@mikro-orm/core';

export abstract class BaseEntity extends MikroOrmBaseEntity {
    @PrimaryKey()
    public id: string = randomUUID();

    @Property()
    public createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    public updatedAt: Date = new Date();
}
