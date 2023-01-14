import { Migration } from '@mikro-orm/migrations';

export class Migration20220906064635 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      alter table "info_source" add column "state" text check("state" in ('Found', 'Resolved', 'Error', 'Disabled')) not null default 'Found';
    `);

    this.addSql('alter table "info_source" add column "continue_searching" bool not null default false');

    this.addSql('update "info_source" set "state" = \'Resolved\' where "data" is not null');
    this.addSql('update "info_source" set "state" = \'Disabled\' where "disabled" = true');
    this.addSql('update "info_source" set "state" = \'Error\' where "resolve_error" = true');
    this.addSql('update "info_source" set "continue_searching" = true where "disabled" = true and "remote_game_id" is not null');

    this.addSql('alter table "info_source" drop column "disabled"');
    this.addSql('alter table "info_source" drop column "resolve_error"');
    this.addSql('alter table "info_source" drop column "remote_game_id"');
    this.addSql('alter table "info_source" drop column "remote_game_name"');

    this.addSql('alter table "info_source" add constraint "info_source_type_unique" unique ("type", "game_id");');
  }
}
