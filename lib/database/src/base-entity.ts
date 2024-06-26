import { BaseEntity as MikroOrmBaseEntity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

export abstract class BaseEntity extends MikroOrmBaseEntity {
    @PrimaryKey()
    public id: string = v4();

    @Property()
    public createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    public updatedAt: Date = new Date();
}
