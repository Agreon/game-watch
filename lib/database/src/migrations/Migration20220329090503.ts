import { Migration } from '@mikro-orm/migrations';

export class Migration20220329090503 extends Migration {

  async up(): Promise<void> {
    // TODO: Default: All
    this.addSql('alter table "user" add column "interested_in_sources" text[] not null default \'{}\';');
    this.addSql('alter table "user" add column "country" varchar(255) not null default \'de-DE\';');
  }

}
