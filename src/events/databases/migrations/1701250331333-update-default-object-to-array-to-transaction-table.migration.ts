import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateDefaultObjectToArrayToTransactionTable1701250331333 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "Transaction" ALTER "uploadProofs" SET DEFAULT '[]'`);
        await queryRunner.manager.query(`ALTER TABLE "Transaction" ALTER "uploadInvoices" SET DEFAULT '[]'`);
        await queryRunner.manager.query(`ALTER TABLE "Transaction" ALTER "uploadPackingLists" SET DEFAULT '[]'`);

        await queryRunner.manager.query(`ALTER TABLE "RecordProduct" ALTER "uploadProofs" SET DEFAULT '[]'`);
    }
}
