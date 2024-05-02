import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddConstrainUniqToFacilityPartnerTable1646115932604 extends BaseMigration {
    private constraintName = 'UQ_FacilityPartner_partnerId_facilityId';

    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "FacilityPartner" ADD CONSTRAINT ${this.constraintName} UNIQUE ("partnerId", "facilityId")`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "FacilityPartner" DROP CONSTRAINT ${this.constraintName}`);
    }
}
