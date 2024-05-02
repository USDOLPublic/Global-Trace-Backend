import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddSomeFieldToRiskAssessmentTable1698394655449 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('RiskAssessment', (table) => {
            table.decimal('dnaWeight').nullable();
            table.decimal('geographyWeight').nullable();
            table.decimal('listOfGoodsWeight').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('RiskAssessment', (table) => {
            table.dropColumn('dnaWeight');
            table.dropColumn('geographyWeight');
            table.dropColumn('listOfGoodsWeight');
        });
    }
}
