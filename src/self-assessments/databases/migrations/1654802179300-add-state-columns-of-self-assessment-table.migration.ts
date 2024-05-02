import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddStateColumnsOfSelfAssessmentTable1654802179300 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SelfAssessment', (table) => {
            table.uuid('onGoingAnswerAtGroupId').nullable();
            table.uuid('onGoingAnswerAtQuestionId').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('SelfAssessment', (table) => {
            table.dropColumn('onGoingAnswerAtGroupId');
            table.dropColumn('onGoingAnswerAtQuestionId');
        });
    }
}
