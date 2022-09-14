import { Migration } from '@mikro-orm/migrations';

export class Migration20220906064635 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      alter table "info_source" add column "state" text check("state" in ('Initial', 'Found', 'Resolved', 'Error', 'Disabled')) not null default 'Initial';
    `);

    this.addSql('update "info_source" set "state" = \'Resolved\' where "data" IS NOT null');
    this.addSql('update "info_source" set "state" = \'Disabled\' where "disabled" = true');
    this.addSql('update "info_source" set "state" = \'Error\' where "resolve_error" = true');

    this.addSql('alter table "info_source" drop column "disabled";');
    this.addSql('alter table "info_source" drop column "resolve_error";');

    this.addSql('alter table "info_source" add constraint "info_source_type_unique" unique ("type", "game_id");');
  }

  async down(): Promise<void> {
  }
}
