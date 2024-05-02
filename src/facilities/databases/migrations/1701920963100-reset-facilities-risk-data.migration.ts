import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class ResetFacilitiesRiskData1701920963100 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `UPDATE "Facility" SET "overallRiskScore" = null,  "overallRiskLevel" = null,  "riskData" = '{}';`
        );
    }
}
