import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateGrievanceReportResponseTable1649048573030 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('GrievanceReportResponse', (table) => {
            table.primaryUuid('id');
            table.uuid('grievanceReportId').index().foreign('GrievanceReport');
            table.timestamp('recordedAt');
            table.string('severity');
            table.string('indicator');
            table.string('message');
            table.string('uploadImage');
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('GrievanceReportResponse');
    }
}
