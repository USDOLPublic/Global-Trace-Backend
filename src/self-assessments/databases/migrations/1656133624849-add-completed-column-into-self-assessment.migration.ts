import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddCompletedColumnIntoSelfAssessment1656133624849 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SelfAssessment', (table) => {
            table.timestamp('completedSaqAt').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('SelfAssessment', (table) => {
            table.dropColumn('completedSaqAt');
        });
    }
}
