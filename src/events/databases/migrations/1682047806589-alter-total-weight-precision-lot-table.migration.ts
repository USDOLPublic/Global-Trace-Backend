import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterTotalWeightPrecisionLotTable1682047806589 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            `ALTER TABLE "Lot" ALTER COLUMN "totalWeight" TYPE NUMERIC(14,2);
            ALTER TABLE "Lot" ALTER COLUMN "totalWeight"  SET DEFAULT 0;
            `
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            `ALTER TABLE "Lot" ALTER COLUMN "totalWeight" TYPE NUMERIC(10,2);
            ALTER TABLE "Lot" ALTER COLUMN "totalWeight"  SET DEFAULT 0;
            `
        );
    }
}
