import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTransactionTable1646367332075 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Transaction', (table) => {
            table.primaryUuid('id');
            table.uuid('fromFacilityId').index().foreign('Facility');
            table.uuid('toFacilityId').index().foreign('Facility');
            table.decimal('price').default(0);
            table.string('currency').nullable();
            table.decimal('totalWeight').default(0);
            table.string('weightUnit').nullable();
            table.string('purchaseOrderNumber').nullable();
            table.string('invoiceNumber').nullable();
            table.string('packingListNumber').nullable();
            table.timestamp('transactedAt');
            table.jsonb('uploadProofs').default("'{}'::jsonb");
            table.jsonb('uploadInvoices').default("'{}'::jsonb");
            table.jsonb('uploadPackingLists').default("'{}'::jsonb");
            table.uuid('creatorId');
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Transaction');
    }
}
