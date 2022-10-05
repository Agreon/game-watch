import { Migration } from '@mikro-orm/migrations';

export class Migration20221006064636 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "info_source" add column "country" varchar(255) not null default \'DE\';');
  }

  async down(): Promise<void> { }
}
