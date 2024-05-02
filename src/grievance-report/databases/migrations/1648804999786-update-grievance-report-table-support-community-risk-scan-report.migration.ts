import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateGrievanceReportTableSupportCommunityRiskScanReport1648804999786 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "GrievanceReport" ALTER "facilityId" DROP NOT NULL;`);
        await queryRunner.manager.query(`ALTER TABLE "GrievanceReport" ALTER "reason" DROP NOT NULL;`);
        await this.update('GrievanceReport', (table) => {
            table.string('facilityName').nullable();
            table.jsonb('coordinates').nullable();
            table.timestamp('recordedAt').nullable();
            table.string('uploadImage').nullable();
            table.string('severity').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "GrievanceReport" ALTER "facilityId" SET NOT NULL;`);
        await queryRunner.manager.query(`ALTER TABLE "GrievanceReport" ALTER "reason" SET NOT NULL;`);
        await this.update('User', (table) => {
            table.dropColumn('facilityName');
            table.dropColumn('coordinates');
            table.dropColumn('recordedAt');
            table.dropColumn('uploadImage');
            table.dropColumn('severity');
        });
    }
}
