import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { IncidentReportStatus } from '~grievance-report/enums/incident-report-status.enum';

export class AddStatusToGrievanceReportTable1699950715583 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.integer('status').default(IncidentReportStatus.NEW);
        });

        await queryRunner.manager.query(
            `UPDATE "GrievanceReport" SET "status"= '${IncidentReportStatus.RESPONSED_SENT}' WHERE "isResponded" = true`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.dropColumn('status');
        });
    }
}
