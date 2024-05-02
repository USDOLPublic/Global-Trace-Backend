import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnStatusAndPriorityToGrievanceReportResponseTable1680254775872 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('GrievanceReportResponse', (table) => {
            table.integer('status').nullable();
            table.integer('priority').nullable();
            table.dropColumn('indicator');
            table.dropColumn('severity');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('GrievanceReportResponse', (table) => {
            table.string('indicator').nullable();
            table.string('severity').nullable();
            table.dropColumn('status');
            table.dropColumn('priority');
        });
    }
}
