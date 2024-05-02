import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateRecordProductTable1647569890873 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('RecordProduct', (table) => {
            table.primaryUuid('id');
            table.decimal('totalWeight');
            table.string('weightUnit');
            table.timestamp('recordedAt');
            table.jsonb('uploadProofs').default("'{}'::jsonb");
            table.uuid('facilityId').index().foreign('Facility');
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('RecordProduct');
    }
}
