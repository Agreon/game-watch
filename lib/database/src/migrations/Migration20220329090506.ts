import { Migration } from '@mikro-orm/migrations';

export class Migration20220329090506 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "user" add column "email_confirmation_token" varchar(255);');
    this.addSql('alter table "user" add constraint "email_confirmation_token_unique" unique ("email_confirmation_token");');
    this.addSql('alter table "user" add column "email_confirmed" bool default false;');
  }
}
