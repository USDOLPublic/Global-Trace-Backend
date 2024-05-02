import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterColumnFacilityTypeNullable1649901142057 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "Facility" ALTER "type" DROP NOT NULL;`);
        await queryRunner.manager.query(`ALTER TABLE "FacilityPartner" ALTER "type" DROP NOT NULL;`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "Facility" ALTER "type" SET NOT NULL;`);
        await queryRunner.manager.query(`ALTER TABLE "FacilityPartner" ALTER "type" SET NOT NULL;`);
    }
}
