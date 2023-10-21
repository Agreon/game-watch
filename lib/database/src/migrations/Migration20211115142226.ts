import { Migration } from '@mikro-orm/migrations';

export class Migration20211115142226 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "game" add column "setup_completed" bool not null default true');
  }
}
