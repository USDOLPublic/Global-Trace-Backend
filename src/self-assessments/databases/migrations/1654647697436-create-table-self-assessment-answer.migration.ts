import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableSelfAssessmentAnswer1654647697436 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('SelfAssessmentAnswer', (table) => {
            table.primaryUuid('id');
            table.uuid('selfAssessmentId').index().foreign('SelfAssessment');
            table.uuid('groupId').index().foreign('SelfAssessmentGroup');
            table.uuid('selfAssessmentQuestionId').index().foreign('SelfAssessmentQuestion');
            table.boolean('isDraft');
            table.jsonb('answer').default("'{}'::jsonb");
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('SelfAssessmentAnswer');
    }
}
