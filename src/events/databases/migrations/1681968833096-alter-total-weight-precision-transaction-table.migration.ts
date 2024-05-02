import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterTotalWeightPrecisionTransactionTable1681968833096 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            `ALTER TABLE "Transaction" ALTER COLUMN "totalWeight" TYPE NUMERIC(14,2);
            ALTER TABLE "Transaction" ALTER COLUMN "totalWeight"  SET DEFAULT 0;
            `
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            `ALTER TABLE "Transaction" ALTER COLUMN "totalWeight" TYPE NUMERIC(10,2);
            ALTER TABLE "Transaction" ALTER COLUMN "totalWeight"  SET DEFAULT 0;
            `
        );
    }
}
