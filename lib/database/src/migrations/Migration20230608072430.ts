import { Migration } from '@mikro-orm/migrations';

export class Migration20230608072430 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "info_source" alter column "data" type jsonb');
    this.addSql('alter table "notification" alter column "data" type jsonb');
  }
}
