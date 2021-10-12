import { Migration } from '@mikro-orm/migrations';

export class Migration20211012071707 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "game" ("id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "search" varchar(255) not null, "name" varchar(255) null, "description" varchar(255) not null);');
    this.addSql('alter table "game" add constraint "game_pkey" primary key ("id");');

    this.addSql('create table "info_source" ("id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "type" text check ("type" in (\'steam\', \'nintendo\', \'psStore\')) not null, "remote_game_id" varchar(255) not null, "disabled" bool not null, "resolve_error" bool not null, "data" json null, "game_id" varchar(255) not null);');
    this.addSql('alter table "info_source" add constraint "info_source_pkey" primary key ("id");');

    this.addSql('alter table "info_source" add constraint "info_source_game_id_foreign" foreign key ("game_id") references "game" ("id") on update cascade;');
  }

}
