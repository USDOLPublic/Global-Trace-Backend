import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddConstraintUniqueToFacilityUserTable1645143184156 extends BaseMigration {
    private constraintName = 'UQ_FacilityUser_userId_facilityId';

    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "FacilityUser" ADD CONSTRAINT ${this.constraintName} UNIQUE ("userId", "facilityId")`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "FacilityUser" DROP CONSTRAINT ${this.constraintName}`);
    }
}
