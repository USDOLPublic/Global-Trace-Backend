import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateFieldIsNoFollowUpGrievanceReportTable1653367540455 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.boolean('isNoFollowUp').default(false);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.dropColumn('isNoFollowUp');
        });
    }
}
