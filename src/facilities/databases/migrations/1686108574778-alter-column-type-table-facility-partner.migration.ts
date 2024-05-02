import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterColumnTypeTableFacilityPartner1686108574778 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('FacilityPartner', (table) => {
            table.uuid('typeId').index().nullable().foreign('Role');
        });

        await this.migrationType(queryRunner);

        await this.update('FacilityPartner', (table) => {
            table.dropColumn('type');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('FacilityPartner', (table) => {
            table.dropColumn('typeId');
            table.integer('type').index();
        });
    }

    async migrationType(queryRunner: QueryRunner) {
        await queryRunner.query(`
            UPDATE "FacilityPartner"
            SET "typeId" = "temp"."typeId"
            FROM (
                SELECT "fcp"."id" "faId", "rol"."id" "typeId"
                FROM "FacilityPartner" "fcp" 
                LEFT JOIN "Role" "rol" ON (
                CASE "fcp"."type"
                    WHEN 1 THEN 'FARM_GROUP'
                    WHEN 2 THEN 'GINNER'
                    WHEN 3 THEN 'SPINNER'
                    WHEN 4 THEN 'BROKER'
                    WHEN 5 THEN 'TRANSPORTER'
                    WHEN 6 THEN 'MILL'
                    WHEN 7 THEN 'BRAND'
                    WHEN 8 THEN 'AUDITOR'
                    WHEN 9 THEN 'FARM_MONITOR'
                    WHEN 10 THEN 'FINAL_PRODUCT_ASSEMBLY'
                    WHEN 11 THEN 'FARM'
                    WHEN 12 THEN 'FARM_MONITOR_WEB'
                END
                ) = "rol"."name"   
            ) temp
            WHERE "FacilityPartner"."id" = "temp"."faId";
        `);
    }
}
