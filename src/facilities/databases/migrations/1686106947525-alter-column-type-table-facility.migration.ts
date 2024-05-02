import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterColumnTypeTableFacility1686106947525 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.uuid('typeId').index().nullable().foreign('Role');
        });

        await this.migrationType(queryRunner);

        await this.update('Facility', (table) => {
            table.dropColumn('type');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.dropColumn('typeId');
            table.integer('type').index();
        });
    }

    async migrationType(queryRunner: QueryRunner) {
        await queryRunner.query(`
            UPDATE "Facility"
            SET "typeId" = "temp"."typeId"
            FROM (
                SELECT "fcl"."id" "faId", "rol"."id" "typeId"
                FROM "Facility" "fcl" 
                LEFT JOIN "Role" "rol" ON (
                CASE "fcl"."type"
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
            WHERE "Facility"."id" = "temp"."faId";
        `);
    }
}
