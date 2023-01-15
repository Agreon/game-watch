import { Migration } from '@mikro-orm/migrations';

export class Migration20231006064638 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "game" add column "continue_searching" bool not null default true');

    this.addSql('alter table "info_source" drop constraint if exists "info_source_type_check";');
    this.addSql('alter table "info_source" alter column "type" type text using ("type"::text);');
    this.addSql('alter table "info_source" add constraint "info_source_type_check" check ("type" in (\'steam\', \'switch\', \'playstation\', \'epic\', \'metacritic\', \'proton\'));');
  }
}
