import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RemoveParentGroupIdColumnAndAddDefaultTotalDrafQuestionValueColumn1654790973210 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentGroup', (table) => {
            table.dropColumn('parentGroupId');
        });

        await queryRunner.query(`ALTER TABLE "SelfAssessment" ALTER "totalDraftAnswers" SET DEFAULT 0;`);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentGroup', (table) => {
            table.uuid('parentGroupId').index().foreign('SelfAssessmentGroup');
        });

        await queryRunner.query(`ALTER TABLE "SelfAssessment" ALTER "totalDraftAnswers" DROP DEFAULT;`);
    }
}
