import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RemoveFieldHotlineAndAuditorToRiskAssessmentTable1700106752595 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('RiskAssessment', (table) => {
            table.dropColumn('hotlineWeight');
            table.dropColumn('auditorsWeight');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('RiskAssessment', (table) => {
            table.decimal('hotlineWeight', 14, 2).nullable();
            table.decimal('auditorsWeight', 14, 2).nullable();
        });
    }
}
