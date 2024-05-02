import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterTotalWeightPrecisionYarnTable1682047750845 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            `ALTER TABLE "Yarn" ALTER COLUMN "totalWeight" TYPE NUMERIC(14,2);
            ALTER TABLE "Yarn" ALTER COLUMN "totalWeight"  SET DEFAULT 0;
            `
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            `ALTER TABLE "Yarn" ALTER COLUMN "totalWeight" TYPE NUMERIC(10,2);
            ALTER TABLE "Yarn" ALTER COLUMN "totalWeight"  SET DEFAULT 0;
            `
        );
    }
}
