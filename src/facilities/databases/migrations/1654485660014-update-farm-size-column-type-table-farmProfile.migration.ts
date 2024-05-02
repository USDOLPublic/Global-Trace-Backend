import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateFarmSizeColumnTypeTableFarmProfile1654485660014 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "FarmProfile" ALTER COLUMN "farmSize" TYPE DECIMAL(10,2)`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "FarmProfile" ALTER COLUMN "farmSize" TYPE INTEGER`);
    }
}
