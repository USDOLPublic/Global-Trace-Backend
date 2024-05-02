import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableSelfAssessment1654643956581 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('SelfAssessment', (table) => {
            table.primaryUuid('id');
            table.uuid('forFacilityId').index().foreign('Facility');
            table.integer('totalQuestions');
            table.integer('totalDraftAnswers');
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('SelfAssessment');
    }
}
