import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateDnaTestTable1659424363320 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('DnaTesting', (table) => {
            table.primaryUuid('id');
            table.uuid('requestFaciltityId').index().foreign('Facility');
            table.uuid('productSupplierId').index().foreign('Facility');
            table.string('productId');
            table.timestamp('testedAt');
            table.integer('status');
            table.string('dnaIdentifier');
            table.jsonb('uploadProofs').default("'{}'::jsonb");
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('DnaTesting');
    }
}
