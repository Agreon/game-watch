import { Migration } from '@mikro-orm/migrations';

export class Migration20220227090503 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "info_source" add column "excluded_remote_game_ids" text[] not null default \'{}\'');
    this.addSql('alter table "info_source" alter column "remote_game_id" drop not null');
    this.addSql('alter table "info_source" alter column "remote_game_name" drop not null');
  }
}
