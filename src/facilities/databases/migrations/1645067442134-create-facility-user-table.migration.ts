import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateFacilityUserTable1645067442134 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('FacilityUser', (table) => {
            table.primaryUuid('id');
            table.uuid('userId').index().foreign('User');
            table.uuid('facilityId').index().foreign('Facility');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('FacilityUser');
    }
}
