import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddTranslationColumnSelfAssessmentQuestionResponseTable1699548916078 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentQuestionResponse', (table) => {
            table.jsonb('translation').default("'{}'::jsonb");
        });

        await queryRunner.manager.query(
            `Update "SelfAssessmentQuestionResponse" set "translation" = jsonb("translation") || jsonb_build_object('en', "option")`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentQuestionResponse', (table) => {
            table.dropColumn('translation');
        });
    }
}
