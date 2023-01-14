import { Migration } from '@mikro-orm/migrations';

export class Migration20220930064636 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "game" drop constraint "game_user_id_foreign";');
    this.addSql('alter table "info_source" drop constraint "info_source_game_id_foreign";');
    this.addSql('alter table "info_source" drop constraint "info_source_user_id_foreign";');
    this.addSql('alter table "tag" drop constraint "tag_user_id_foreign";');

    this.addSql('alter table "game" add constraint "game_user_id_foreign" foreign key ("user_id") references "user" ("id") on delete cascade;');
    this.addSql('alter table "info_source" add constraint "info_source_user_id_foreign" foreign key ("user_id") references "user" ("id") on delete cascade;');
    this.addSql('alter table "info_source" add constraint "info_source_game_id_foreign" foreign key ("game_id") references "game" ("id") on delete cascade;');
    this.addSql('alter table "tag" add constraint "tag_user_id_foreign" foreign key ("user_id") references "user" ("id") on delete cascade;');
  }
}
