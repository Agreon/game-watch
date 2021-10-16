import { Migration } from '@mikro-orm/migrations';

export class Migration20211016134626 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "tag" add column "color" varchar(255) not null;');
  }

}
