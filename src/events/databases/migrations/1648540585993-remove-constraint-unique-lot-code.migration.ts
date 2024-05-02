import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RemoveConstraintUniqueLotCode1648540585993 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query('ALTER TABLE "Lot" DROP CONSTRAINT "Lot_Unique_lotCode";');
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query('ALTER TABLE "Lot" ADD CONSTRAINT "Lot_Unique_lotCode" UNIQUE ("lotCode");');
    }
}
