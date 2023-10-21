import { Migration } from '@mikro-orm/migrations';

export class Migration20220906064634 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "notification" drop constraint "notification_game_id_foreign"');
    this.addSql('alter table "notification" drop constraint "notification_info_source_id_foreign"');
    this.addSql('alter table "notification" drop constraint "notification_user_id_foreign"');

    this.addSql(`
      alter table "notification"
      add constraint "notification_game_id_foreign" foreign key ("game_id")
      references "game" ("id") on delete cascade
    `);
    this.addSql(`
      alter table "notification"
      add constraint "notification_info_source_id_foreign" foreign key ("info_source_id")
      references "info_source" ("id") on update cascade on delete cascade
    `);
    this.addSql(`
      alter table "notification"
      add constraint "notification_user_id_foreign" foreign key ("user_id")
      references "user" ("id") on update cascade on delete cascade
    `);
  }
}
