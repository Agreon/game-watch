import { Migration } from '@mikro-orm/migrations';

export class Migration20240906064650 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "info_source" drop constraint if exists "info_source_type_check"');
    this.addSql('alter table "info_source" alter column "type" type text using ("type"::text)');
    this.addSql(`
      alter table "info_source"
      add constraint "info_source_type_check" check ("type" in (
        'steam',
        'switch',
        'playstation',
        'epic',
        'metacritic',
        'opencritic',
        'proton'
      ))
    `);

    this.addSql('alter table "notification" drop constraint if exists "notification_type_check"');
    this.addSql('alter table "notification" alter column "type" type text using ("type"::text)');
    this.addSql(`
      alter table "notification"
      add constraint "notification_type_check" check ("type" in (
        'new-store-entry',
        'release-date-changed',
        'game-released',
        'game-reduced',
        'new-metacritic-rating',
        'new-metacritic-user-rating',
        'new-opencritic-rating',
        'new-proton-db-rating',
        'proton-db-rating-increased',
        'left-early-access',
        'added-to-ps-plus',
        'resolve-error'
      ))
    `);
  }
}
