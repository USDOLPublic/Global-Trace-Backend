import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class ChangeTypeMoistureLevelRawCottonTable1657081781898 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "RawCotton" ALTER COLUMN "moistureLevel" TYPE DECIMAL(10,2)`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "RawCotton" ALTER COLUMN "moistureLevel" TYPE INTEGER`);
    }
}
