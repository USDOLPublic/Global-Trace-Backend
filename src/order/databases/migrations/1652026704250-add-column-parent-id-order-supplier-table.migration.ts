import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnParentIdOrderSupplierTable1652026704250 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query('DELETE FROM "OrderSupplier" WHERE "fromSupplierId" IS NOT NULL;');

        await this.update('OrderSupplier', (table) => {
            table.uuid('parentId').nullable().index().foreign('OrderSupplier');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('OrderSupplier', (table) => {
            table.dropColumn('parentId');
        });
    }
}
