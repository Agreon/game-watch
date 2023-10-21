import { Migration } from '@mikro-orm/migrations';

export class Migration20211129140628 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table "notification" (
        "id" varchar(255) not null,
        "created_at" timestamptz(0) not null,
        "updated_at" timestamptz(0) not null,
        "type" text check ("type" in (
          'new-store-entry',
          'release-date-changed',
          'game-released',
          'game-reduced',
          'new-metacritic-rating'
        ))
        not null,
        "read" bool not null,
        "data" json null,
        "game_id" varchar(255) not null,
        "info_source_id" varchar(255) not null
      )
    `);
    this.addSql('alter table "notification" add constraint "notification_pkey" primary key ("id")');

    this.addSql(`
      alter table "notification"
      add constraint "notification_game_id_foreign" foreign key ("game_id")
      references "game" ("id") on update cascade
    `);
    this.addSql(`
      alter table "notification"
      add constraint "notification_info_source_id_foreign" foreign key ("info_source_id")
      references "info_source" ("id") on update cascade
    `);
  }
}
