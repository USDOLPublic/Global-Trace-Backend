import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class ChangeTypeFieldsOrdersTable1649928649950 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query('ALTER TABLE "Order" ALTER "invoiceNumber" DROP NOT NULL;');
        await queryRunner.query('ALTER TABLE "Order" ALTER "packingListNumber" DROP NOT NULL;');
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "Order" ALTER "invoiceNumber" SET NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "Order" ALTER "packingListNumber" SET NOT NULL;`);
    }
}
