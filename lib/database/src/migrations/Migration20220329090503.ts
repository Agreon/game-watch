import { Migration } from '@mikro-orm/migrations';

export class Migration20220329090503 extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      alter table "user" add column "interested_in_sources" text[] not null default '{
        steam,
        switch,
        psStore,
        epic,
        metacritic
      }';
    `);

    this.addSql('alter table "user" add column "country" varchar(255) not null default \'DE\';');
    this.addSql('create index "notification_read_index" on "notification" ("read");');
  }
}
