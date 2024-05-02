import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableProvince1646026855805 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Province', (table) => {
            table.primaryUuid('id');
            table.uuid('countryId').index().foreign('Country');
            table.string('provinceCode').nullable();
            table.string('province').index().nullable();
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });

        await queryRunner.manager.query(`ALTER TABLE "Province" ADD COLUMN "fullTextSearchable" tsvector;`);
        await queryRunner.manager.query(
            ` UPDATE "Province" SET "fullTextSearchable" = to_tsvector('simple', coalesce("province", ''))`
        );
        await queryRunner.manager.query(
            `CREATE TRIGGER "tsvectorProvince" BEFORE INSERT OR UPDATE
            ON "Province" FOR EACH ROW EXECUTE FUNCTION
            tsvector_update_trigger("fullTextSearchable", 'pg_catalog.simple', "province");`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`DROP TRIGGER IF EXISTS "tsvectorProvince" ON "Province";`);
        await queryRunner.manager.query(`ALTER TABLE "Province" DROP COLUMN IF EXISTS "fullTextSearchable";`);
        await this.drop('Province');
    }
}
