import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableCountry1627409606398 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Country', (table) => {
            table.primaryUuid('id');
            table.string('countryCode').nullable();
            table.string('country').index().nullable();
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });

        await queryRunner.manager.query(`ALTER TABLE "Country" ADD COLUMN "fullTextSearchable" tsvector;`);
        await queryRunner.manager.query(
            ` UPDATE "Country" SET "fullTextSearchable" = to_tsvector('simple', coalesce("country", ''))`
        );
        await queryRunner.manager.query(
            `CREATE TRIGGER "tsvectorCountry" BEFORE INSERT OR UPDATE
            ON "Country" FOR EACH ROW EXECUTE FUNCTION
            tsvector_update_trigger("fullTextSearchable", 'pg_catalog.simple', "country");`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`DROP TRIGGER IF EXISTS "tsvectorCountry" ON "Country";`);
        await queryRunner.manager.query(`ALTER TABLE "Country" DROP COLUMN IF EXISTS "fullTextSearchable";`);
        await this.drop('Country');
    }
}
