import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class DropStatusOfGrievanceReportResponse1681721722025 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('GrievanceReportResponse', (table) => {
            table.dropColumn('status');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('GrievanceReportResponse', (table) => {
            table.integer('status').nullable();
        });
    }
}
