import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateRiskLevelValueSelfAssessmentQuestionResponse1701096625510 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentQuestionResponse', (table) => {
            table.integer('riskLevelInt').nullable();
        });

        await queryRunner.query(
            `UPDATE "SelfAssessmentQuestionResponse" SET "riskLevelInt" = CASE 
                WHEN "riskLevel" = \'High\' THEN 3 
                WHEN "riskLevel" = \'Medium\' THEN 2
                WHEN "riskLevel" = \'Low\' THEN 1
                ELSE NULL
                END`
        );

        await this.update('SelfAssessmentQuestionResponse', (table) => {
            table.dropColumn('riskLevel');
        });

        await queryRunner.query(
            'ALTER TABLE "SelfAssessmentQuestionResponse" RENAME COLUMN "riskLevelInt" TO "riskLevel"'
        );
    }
}
