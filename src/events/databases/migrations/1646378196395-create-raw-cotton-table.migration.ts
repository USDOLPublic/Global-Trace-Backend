import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateRawCottonTable1646378196395 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('RawCotton', (table) => {
            table.primaryUuid('id');
            table.string('trashContent');
            table.integer('moistureLevel');
            table.string('cottonCertification');
            table.string('grade').nullable();
            table.decimal('totalWeight');
            table.string('weightUnit');
            table.boolean('isTransformed').index().default(false);
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('RawCotton');
    }
}
