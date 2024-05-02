import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateFabricTable1647416142558 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Fabric', (table) => {
            table.primaryUuid('id');
            table.string('code').unique();
            table.decimal('totalWeight');
            table.string('weightUnit');
            table.string('description');
            table.uuid('createdFacilityId');
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Fabric');
    }
}
