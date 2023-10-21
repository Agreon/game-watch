import { Migration } from '@mikro-orm/migrations';

export class Migration20211016065028 extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      create table "tag" (
        "id" varchar(255) not null,
        "created_at" timestamptz(0) not null,
        "updated_at" timestamptz(0) not null,
        "name" varchar(255) not null
      )
    `);
    this.addSql('alter table "tag" add constraint "tag_pkey" primary key ("id")');

    this.addSql('alter table "game" add column "search" varchar(255) not null');
    this.addSql('alter table "game" drop constraint if exists "game_name_check"');
    this.addSql('alter table "game" alter column "name" type varchar(255) using ("name"::varchar(255))');
    this.addSql('alter table "game" alter column "name" drop not null');

    this.addSql('create table "game_tags" ("game_id" varchar(255) not null, "tag_id" varchar(255) not null)');
    this.addSql('alter table "game_tags" add constraint "game_tags_pkey" primary key ("game_id", "tag_id")');

    this.addSql(`
      alter table "game_tags"
      add constraint "game_tags_game_id_foreign" foreign key ("game_id")
      references "game" ("id") on update cascade on delete cascade
    `);
    this.addSql(`
      alter table "game_tags"
      add constraint "game_tags_tag_id_foreign" foreign key ("tag_id")
      references "tag" ("id") on update cascade on delete cascade
    `);
  }

}
