import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterColumnOptionNullableTableSaqResponse1699417511654 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "SelfAssessmentQuestionResponse" ALTER "option" DROP NOT NULL;`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "SelfAssessmentQuestionResponse" ALTER "option" SET NOT NULL;`);
    }
}
