import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddSeasonDateToRoleTable1705032389307 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "Role" ADD COLUMN "seasonStartDate" DATE;`);
        await this.update('Role', (table) => {
            table.integer('seasonDuration').nullable();
            table.boolean('isRawMaterialExtractor').nullable();
        });

        await queryRunner.query(
            `UPDATE "Role" SET "isRawMaterialExtractor" = true, "seasonStartDate" = "BusinessDetail"."startDateOfSeason", "seasonDuration" = "BusinessDetail"."sessionDuration"::integer FROM "BusinessDetail" WHERE "Role"."name" = 'FARM';`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Role', (table) => {
            table.dropColumn('seasonStartDate');
            table.dropColumn('seasonDuration');
            table.dropColumn('isRawMaterialExtractor');
        });
    }
}
