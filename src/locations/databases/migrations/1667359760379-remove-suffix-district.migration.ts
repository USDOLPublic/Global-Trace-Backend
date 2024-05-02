import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RemoveSuffixDistrict1667359760379 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            `UPDATE "District" SET "district" = RTRIM("district", ' District') WHERE "district" LIKE ('% District')`
        );

        await queryRunner.manager.query(
            `UPDATE "District" SET "district" = RTRIM("district", ' district') WHERE "district" LIKE ('% district')`
        );

        await queryRunner.manager.query(
            `UPDATE "Facility" SET "district" = RTRIM("district", ' District') WHERE "district" LIKE ('% District')`
        );

        await queryRunner.manager.query(
            `UPDATE "Facility" SET "district" = RTRIM("district", ' district') WHERE "district" LIKE ('% district')`
        );
    }
}
