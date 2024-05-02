import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateFacilityItemTable1646367293950 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('FacilityItem', (table) => {
            table.primaryUuid('id');
            table.uuid('facilityId').index().foreign('Facility');
            table.uuid('entityId');
            table.string('entityType');
            table.createdAt();
            table.updatedAt();
        });

        await queryRunner.manager.query(
            'CREATE INDEX "FacilityItem_Index_entityId_entityType" ON "FacilityItem" ("entityId", "entityType");'
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('FacilityItem');
    }
}
