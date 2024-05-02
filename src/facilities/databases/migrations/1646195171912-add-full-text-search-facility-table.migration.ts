import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddFullTextSearchFacilityTable1646195171912 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "Facility" ADD COLUMN "fullTextSearchable" tsvector;`);
        await queryRunner.manager.query(`
            UPDATE "Facility" SET "fullTextSearchable" =
                to_tsvector('simple', coalesce("name", '') || ' ' || coalesce("oarId", '') || ' ' || coalesce("businessRegisterNumber", ''));
        `);
        await queryRunner.manager.query(`
            CREATE INDEX "facility_searchable_idx" ON "Facility" USING GIN ("fullTextSearchable");
        `);
        await queryRunner.manager.query(
            `CREATE TRIGGER "tsvectorFacility" BEFORE INSERT OR UPDATE
            ON "Facility" FOR EACH ROW EXECUTE FUNCTION
            tsvector_update_trigger("fullTextSearchable", 'pg_catalog.simple', "name", "oarId", "businessRegisterNumber");`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`DROP TRIGGER IF EXISTS "tsvectorDataPoint" ON "Facility";`);
        await queryRunner.manager.query(`ALTER TABLE "Facility" DROP COLUMN IF EXISTS "fullTextSearchable";`);
    }
}
