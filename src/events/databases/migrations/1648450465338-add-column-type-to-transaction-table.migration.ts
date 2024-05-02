import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnTypeToTransactionTable1648450465338 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Transaction', (table) => {
            table.integer('type').nullable().index();
        });

        await queryRunner.query(
            `UPDATE "Transaction" SET "type" = 1 WHERE "toFacilityId" = "facilityId";
            UPDATE "Transaction" SET "type" = 2 WHERE "fromFacilityId" = "facilityId" AND "price" != 0;
            UPDATE "Transaction" SET "type" = 3 WHERE "fromFacilityId" = "facilityId" AND "type" IS NULL;`
        );

        await queryRunner.query('ALTER TABLE "Transaction" ALTER "type" SET NOT NULL;');
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Transaction', (table) => {
            table.dropColumn('type');
        });
    }
}
