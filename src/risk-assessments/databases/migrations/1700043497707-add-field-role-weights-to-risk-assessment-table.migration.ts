import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddFieldRoleWeightsToRiskAssessmentTable1700043497707 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('RiskAssessment', (table) => {
            table.jsonb('roleWeights').nullable().default("'[]'::jsonb");
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('RiskAssessment', (table) => {
            table.dropColumn('roleWeights');
        });
    }
}
