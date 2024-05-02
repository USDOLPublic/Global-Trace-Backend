import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddSelfAssessmentQuestionResponseIdAndValueColumnSelfAssessmentAnswerTable1698768551574 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentAnswer', (table) => {
            table.jsonb('values').default("'[]'::jsonb");
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('selfAssessmentQuestionResponseId', (table) => {
            table.dropColumn('values');
        });
    }
}
