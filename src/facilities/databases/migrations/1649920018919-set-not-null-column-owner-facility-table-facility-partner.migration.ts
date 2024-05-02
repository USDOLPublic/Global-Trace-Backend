import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class SetNotNullColumnOwnerFacilityTableFacilityPartner1649920018919 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "FacilityPartner" ALTER "ownerFacilityId" SET NOT NULL;`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "FacilityPartner" ALTER "ownerFacilityId" DROP NOT NULL;`);
    }
}
