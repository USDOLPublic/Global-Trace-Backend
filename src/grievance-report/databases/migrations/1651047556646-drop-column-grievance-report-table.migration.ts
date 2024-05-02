import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class DropColumnGrievanceReportTable1651047556646 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.removeRiskScanReports(queryRunner);
        await queryRunner.manager.query(`ALTER TABLE "GrievanceReport" DROP COLUMN "facilityName";`);
        await queryRunner.manager.query(`ALTER TABLE "GrievanceReport" DROP COLUMN "coordinates";`);
        await queryRunner.manager.query(`ALTER TABLE "GrievanceReport" ALTER "facilityId" SET NOT NULL;`);
    }

    private removeRiskScanReports(queryRunner: QueryRunner) {
        return queryRunner.query(`DELETE FROM "GrievanceReport" WHERE "facilityName" IS NOT NULL`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "GrievanceReport" ALTER "facilityId" DROP NOT NULL;`);
        await this.update('GrievanceReport', (table) => {
            table.string('facilityName').nullable();
            table.jsonb('coordinates').nullable();
        });
    }
}
