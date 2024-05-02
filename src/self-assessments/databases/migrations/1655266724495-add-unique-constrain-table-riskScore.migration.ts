import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddUniqueConstrainTableRiskScore1655266724495 extends BaseMigration {
    private constraintName = 'UQ_RiskScore_selfAssessmentId_groupId_type';

    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "RiskScore" ADD CONSTRAINT ${this.constraintName} UNIQUE ("selfAssessmentId", "groupId", "type")`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "RiskScore" DROP CONSTRAINT ${this.constraintName}`);
    }
}
