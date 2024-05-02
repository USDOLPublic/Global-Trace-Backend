import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class ChangeTypeMoistureLevelLotTable1657093822205 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "Lot" ALTER COLUMN "moistureLevel" TYPE DECIMAL(10,2)`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "Lot" ALTER COLUMN "moistureLevel" TYPE INTEGER`);
    }
}
