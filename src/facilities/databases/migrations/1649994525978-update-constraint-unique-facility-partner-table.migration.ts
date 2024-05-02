import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateConstraintUniqueFacilityPartnerTable1649994525978 extends BaseMigration {
    private oldConstraintName = 'UQ_FacilityPartner_partnerId_facilityId';
    private newConstraintName = 'UQ_FacilityPartner_ownerFacilityId_partnerId_facilityId';

    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "FacilityPartner" DROP CONSTRAINT ${this.oldConstraintName}`);
        await queryRunner.query(
            `ALTER TABLE "FacilityPartner" ADD CONSTRAINT ${this.newConstraintName} UNIQUE ("ownerFacilityId", "partnerId", "facilityId")`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "FacilityPartner" DROP CONSTRAINT ${this.newConstraintName}`);
        await queryRunner.query(
            `ALTER TABLE "FacilityPartner" ADD CONSTRAINT ${this.oldConstraintName} UNIQUE ("partnerId", "facilityId")`
        );
    }
}
