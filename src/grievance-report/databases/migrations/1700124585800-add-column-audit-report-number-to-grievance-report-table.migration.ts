import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnAuditReportNumberToGrievanceReportTable1700124585800 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.string('auditReportNumber').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.dropColumn('auditReportNumber');
        });
    }
}
