import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddOwnerFacilityColumnInFacilityPartnerTable1649903681705 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('FacilityPartner', (table) => {
            table.uuid('ownerFacilityId').nullable().index().foreign('Facility');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('FacilityPartner', (table) => {
            table.dropColumn('ownerFacilityId');
        });
    }
}
