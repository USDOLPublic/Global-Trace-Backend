import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateOwnerFacilityForFacilityPartner1649920018918 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query('UPDATE "FacilityPartner" SET "ownerFacilityId" = "facilityId"');
    }
}
