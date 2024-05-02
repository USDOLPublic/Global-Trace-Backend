import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateBaleTable1646397471754 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Bale', (table) => {
            table.primaryUuid('id');
            table.uuid('lotId').index().foreign('Lot');
            table.string('baleCode');
            table.string('trashContent');
            table.integer('moistureLevel');
            table.string('cottonCertification');
            table.string('grade').nullable();
            table.decimal('totalWeight');
            table.string('weightUnit');
            table.createdAt();
            table.updatedAt();
        });

        await queryRunner.query(
            'ALTER TABLE "Bale" ADD CONSTRAINT "Bale_Unique_lotId_baleCode" UNIQUE ("lotId", "baleCode");'
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Bale');
    }
}
