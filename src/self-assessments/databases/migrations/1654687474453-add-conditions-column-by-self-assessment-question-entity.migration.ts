import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddConditionsColumnBySelfAssessmentQuestionEntity1654687474453 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentQuestion', (table) => {
            table.jsonb('conditions').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentQuestion', (table) => {
            table.dropColumn('conditions');
        });
    }
}
