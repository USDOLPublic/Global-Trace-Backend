import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableFacilityPartner1646040915690 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('FacilityPartner', (table) => {
            table.primaryUuid('id');
            table.uuid('facilityId').index().foreign('Facility');
            table.uuid('partnerId').index().foreign('Facility');
            table.uuid('creatorId');
            table.integer('type');
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('FacilityPartner');
    }
}
