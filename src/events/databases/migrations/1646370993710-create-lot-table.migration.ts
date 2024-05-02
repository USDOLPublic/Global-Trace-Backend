import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateLotTable1646370993710 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Lot', (table) => {
            table.primaryUuid('id');
            table.string('lotCode').index();
            table.decimal('totalWeight');
            table.string('weightUnit');
            table.boolean('isTransformed').index().default(false);
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Lot');
    }
}
