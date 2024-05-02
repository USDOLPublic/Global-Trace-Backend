import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnCreatedFacilityIdToLotTable1646829973397 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.uuid('createdFacilityId').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.dropColumn('createdFacilityId');
        });
    }
}
