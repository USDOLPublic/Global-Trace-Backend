import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RemoveReportsWeightFromRiskAssessmentTable1698402000733 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('RiskAssessment', (table) => {
            table.dropColumn('reportsWeight');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('RiskAssessment', (table) => {
            table.decimal('reportsWeight', 14, 2).nullable();
        });
    }
}
