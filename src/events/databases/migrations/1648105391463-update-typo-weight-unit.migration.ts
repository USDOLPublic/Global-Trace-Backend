import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateTypoWeightUnit1648105391463 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `UPDATE "RawCotton" SET "weightUnit" = 'Unit' WHERE "weightUnit" = 'Units';
            UPDATE "Lot" SET "weightUnit" = 'Unit' WHERE "weightUnit" = 'Units';
            UPDATE "Yarn" SET "weightUnit" = 'Unit' WHERE "weightUnit" = 'Units';
            UPDATE "Fabric" SET "weightUnit" = 'Unit' WHERE "weightUnit" = 'Units';
            UPDATE "RecordProduct" SET "weightUnit" = 'Unit' WHERE "weightUnit" = 'Units';`
        );
    }
}
