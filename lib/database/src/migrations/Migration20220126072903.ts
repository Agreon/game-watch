import { Migration } from '@mikro-orm/migrations';

export class Migration20220126072903 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" varchar(255), "password" varchar(255), "state" text check ("state" in (\'Trial\', \'Registered\', \'Completed\', \'Disabled\')) not null);');
    this.addSql('alter table "user" add constraint "user_pkey" primary key ("id");');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');

    this.addSql('alter table "game" add column "user_id" varchar(255) not null');
    this.addSql('alter table "tag" add column "user_id" varchar(255) not null');

    this.addSql('alter table "tag" add constraint "tag_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "game" add constraint "game_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
  }
}
