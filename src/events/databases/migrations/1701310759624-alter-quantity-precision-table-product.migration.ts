import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterQuantityPrecisionTableProduct1701310759624 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            `ALTER TABLE "Product" ALTER COLUMN "quantity" TYPE NUMERIC(14,2);
            ALTER TABLE "Product" ALTER COLUMN "quantity"  SET DEFAULT 0;
            `
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            `ALTER TABLE "Product" ALTER COLUMN "quantity" TYPE NUMERIC(10,2);
            ALTER TABLE "Product" ALTER COLUMN "quantity"  SET DEFAULT 0;
            `
        );
    }
}
