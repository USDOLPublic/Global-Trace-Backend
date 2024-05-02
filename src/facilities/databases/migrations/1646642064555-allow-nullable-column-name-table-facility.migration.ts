import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AllowNullableColumnNameTableFacility1646642064555 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "Facility" ALTER "name" DROP NOT NULL;`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "Facility" ALTER "name" SET NOT NULL;`);
    }
}
