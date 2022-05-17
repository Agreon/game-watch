import { Migration } from '@mikro-orm/migrations';

export class Migration20220329090504 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "info_source" add column "found_at" timestamptz(0);');
    this.addSql('update "info_source" set "found_at" = "created_at";');
    this.addSql('alter table "info_source" alter column "found_at" set not null;');
  }
}
