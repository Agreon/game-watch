import { Migration } from '@mikro-orm/migrations';

export class Migration20230407084514 extends Migration {
  async up(): Promise<void> {
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
        'new-proton-db-rating',
        'proton-db-rating-increased',
        'left-early-access',
        'resolve-error'
      ))
    `);
  }
}
