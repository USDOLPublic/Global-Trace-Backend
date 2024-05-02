import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateSelfAssessmentAnswerMappingTable1700052799217 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('SelfAssessmentAnswerMapping', (table) => {
            table.primaryUuid('id');
            table.uuid('selfAssessmentAnswerId').index().nullable().foreign('SelfAssessmentAnswer');
            table.uuid('selfAssessmentQuestionResponseId').index().nullable().foreign('SelfAssessmentQuestionResponse');
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('SelfAssessmentAnswerMapping');
    }
}
