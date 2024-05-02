import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class ConvertObjectToArrayToTransactionTable1701232070691 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`UPDATE "Transaction" SET "uploadProofs" = '[]' WHERE "uploadProofs" = '{}'`);
        await queryRunner.manager.query(
            `UPDATE "Transaction" SET "uploadInvoices" = '[]' WHERE "uploadInvoices" = '{}'`
        );
        await queryRunner.manager.query(
            `UPDATE "Transaction" SET "uploadPackingLists" = '[]' WHERE "uploadPackingLists" = '{}'`
        );

        await queryRunner.manager.query(`UPDATE "RecordProduct" SET "uploadProofs" = '[]' WHERE "uploadProofs" = '{}'`);
    }
}
