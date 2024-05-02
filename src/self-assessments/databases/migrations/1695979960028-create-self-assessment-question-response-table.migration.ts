import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateSelfAssessmentQuestionResponseTable1695979960028 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('SelfAssessmentQuestionResponse', (table) => {
            table.primaryUuid('id');
            table.uuid('selfAssessmentQuestionId').index().foreign('SelfAssessmentQuestion');
            table.string('option');
            table.string('optionType').nullable();
            table.uuid('nextQuestionId').nullable().foreign('SelfAssessmentQuestion');
            table.integer('goTo').nullable();
            table.string('riskLevel').nullable();
            table.uuid('indicatorId').index().nullable().foreign('Category');
            table.uuid('subIndicatorId').index().nullable().foreign('Category');
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('SelfAssessmentQuestionResponse');
    }
}
