import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableRiskScore1655195425752 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('RiskScore', (table) => {
            table.primaryUuid('id');
            table.uuid('selfAssessmentId').index().foreign('SelfAssessment');
            table.uuid('groupId').index().foreign('SelfAssessmentGroup');
            table.decimal('riskScore').default(0);
            table.baseTime();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('RiskScore');
    }
}
