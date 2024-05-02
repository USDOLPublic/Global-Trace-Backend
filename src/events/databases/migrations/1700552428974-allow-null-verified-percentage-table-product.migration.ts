import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AllowNullVerifiedPercentageTableProduct1700552428974 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            `ALTER TABLE "Product" ALTER COLUMN "verifiedPercentage" DROP NOT NULL, ALTER COLUMN "notVerifiedPercentage" DROP NOT NULL;`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            `ALTER TABLE "Product" ALTER COLUMN "verifiedPercentage" SET NOT NULL, ALTER COLUMN "notVerifiedPercentage" SET NOT NULL;`
        );
    }
}
