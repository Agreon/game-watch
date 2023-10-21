import { Migration } from '@mikro-orm/migrations';

export class Migration20211115142230 extends Migration {
  async up(): Promise<void> {
    this.addSql(`alter table "info_source" add column "remote_game_name" varchar(255)`);
    this.addSql(`update "info_source" set "remote_game_name" = data->>'fullName'`);
  }
}
