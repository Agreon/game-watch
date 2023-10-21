import { Migration } from '@mikro-orm/migrations';

export class Migration20211020104117 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "info_source" drop constraint if exists "info_source_type_check"');
    this.addSql('alter table "info_source" alter column "type" type text using ("type"::text)');
    this.addSql(`update "info_source" set "type" = 'switch' where "type" = 'nintendo'`);
    this.addSql(`
      alter table "info_source"
      add constraint "info_source_type_check" check ("type" in ('steam', 'switch', 'psStore'));
    `);
  }
}
