import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreatOrderTable1649236695309 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Order', (table) => {
            table.primaryUuid('id');
            table.string('purchaseOrderNumber');
            table.timestamp('purchasedAt');
            table.string('productDescription');
            table.integer('quantity');
            table.string('invoiceNumber');
            table.string('packingListNumber');
            table.uuid('creatorId');
            table.uuid('facilityId').index().foreign('Facility');
            table.uuid('supplierId').index().foreign('Facility');
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Order');
    }
}
