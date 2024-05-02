import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateYarnTable1646837692202 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Yarn', (table) => {
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
        await this.drop('Yarn');
    }
}
