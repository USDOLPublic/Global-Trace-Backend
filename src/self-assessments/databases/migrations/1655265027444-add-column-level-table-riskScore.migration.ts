import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';
import { RiskScoreTypeEnum } from '~self-assessments/enums/risk-score-type.enum';

export class AddColumnLevelTableRiskScore1655265027444 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`DELETE FROM "SelfAssessment"`);

        await this.update('RiskScore', (table) => {
            table.string('level').default(`'${RiskScoreLevelEnum.LOW}'`);
            table.string('type').default(`'${RiskScoreTypeEnum.LABOR_RISK_LEVEL}'`);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('RiskScore', (table) => {
            table.dropColumn('level');
            table.decimal('type');
        });
    }
}
