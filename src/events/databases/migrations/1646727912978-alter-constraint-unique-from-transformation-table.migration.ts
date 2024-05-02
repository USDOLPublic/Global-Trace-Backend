import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterConstraintUniqueFromTransformationTable1646727912978 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "Transformation"
            ADD CONSTRAINT "Transformation_dnaIdentifier_facilityId" UNIQUE ("dnaIdentifier", "facilityId"),
            DROP CONSTRAINT "UQ_d8031e483ceb8c6e63a4dad98d5";`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "Transformation"
            ADD CONSTRAINT "UQ_d8031e483ceb8c6e63a4dad98d5" UNIQUE ("dnaIdentifier"),
            DROP CONSTRAINT "Transformation_dnaIdentifier_facilityId";`
        );
    }
}
