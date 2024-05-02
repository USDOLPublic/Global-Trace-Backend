import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { DEFAULT_LANGUAGE } from '~core/constants/default-language.constant';

export class UpdateQuestionText1658300753536 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const questionId = 'f37f365f-fbab-4af5-949a-8894fbd48d91';
        await queryRunner.query(`UPDATE "SelfAssessmentQuestion" SET "title" = $1 WHERE "id" = $2`, [
            { [DEFAULT_LANGUAGE]: 'Is casual adult labour available in this community?' },
            questionId
        ]);
    }
}
