import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddConstraintUniqueLotCode1646754919355 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query('ALTER TABLE "Lot" ADD CONSTRAINT "Lot_Unique_lotCode" UNIQUE ("lotCode");');
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query('ALTER TABLE "Lot" DROP CONSTRAINT "Lot_Unique_lotCode";');
    }
}
