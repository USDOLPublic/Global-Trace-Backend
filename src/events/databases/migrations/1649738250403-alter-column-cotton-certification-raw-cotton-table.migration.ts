import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterColumnCottonCertificationRawCottonTable1649738250403 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "RawCotton" ALTER "cottonCertification" DROP NOT NULL;`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "RawCotton" ALTER "cottonCertification" SET NOT NULL;`);
    }
}
