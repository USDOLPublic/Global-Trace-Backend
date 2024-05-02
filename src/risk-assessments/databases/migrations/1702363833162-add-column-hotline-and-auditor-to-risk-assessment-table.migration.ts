import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnHotlineAndAuditorToRiskAssessmentTable1702363833162 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('RiskAssessment', (table) => {
            table.decimal('hotlineWeight', 14, 2).nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('RiskAssessment', (table) => {
            table.dropColumn('hotlineWeight');
        });
    }
}
