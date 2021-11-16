import { Migration } from '@mikro-orm/migrations';

export class Migration20211115142225 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "game" add column "syncing" bool not null default false;');

    this.addSql('alter table "info_source" add column "syncing" bool not null default false;');
  }

}
