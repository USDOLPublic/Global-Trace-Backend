import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateDistrictTable1646029026168 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('District', (table) => {
            table.primaryUuid('id');
            table.uuid('provinceId').index().foreign('Province');
            table.integer('districtCode');
            table.string('district').index();
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });

        await queryRunner.manager.query(`ALTER TABLE "District" ADD COLUMN "fullTextSearchable" tsvector;`);
        await queryRunner.manager.query(
            ` UPDATE "District" SET "fullTextSearchable" = to_tsvector('simple', coalesce("district", ''))`
        );
        await queryRunner.manager.query(
            `CREATE TRIGGER "tsvectorDistrict" BEFORE INSERT OR UPDATE
            ON "District" FOR EACH ROW EXECUTE FUNCTION
            tsvector_update_trigger("fullTextSearchable", 'pg_catalog.simple', "district");`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`DROP TRIGGER IF EXISTS "tsvectorDistrict" ON "District";`);
        await queryRunner.manager.query(`ALTER TABLE "District" DROP COLUMN IF EXISTS "fullTextSearchable";`);
        await this.drop('District');
    }
}
