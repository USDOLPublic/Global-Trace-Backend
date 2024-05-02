import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateOrderSupplierTable1650877222077 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('OrderSupplier', (table) => {
            table.primaryUuid('id');
            table.uuid('orderId').index().foreign('Order');
            table.uuid('supplierId').index().foreign('Facility');
            table.uuid('fromSupplierId').nullable().index().foreign('Facility');
            table.string('tier');
            table.string('purchaseOrderNumber').nullable();
            table.timestamp('purchasedAt').nullable();
            table.string('invoiceNumber').nullable();
            table.string('packingListNumber').nullable();
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('OrderSupplier');
    }
}
