import { Migration } from '@mikro-orm/migrations';

export class Migration20231006064638 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "game" add column "continue_searching" bool not null default true');
  }
}
