import { Migration } from '@mikro-orm/migrations';

export class Migration20220329090505 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "user" add column "email" varchar(255)');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email")');
    this.addSql('alter table "user" add column "enable_email_notifications" bool not null default false');
  }
}
