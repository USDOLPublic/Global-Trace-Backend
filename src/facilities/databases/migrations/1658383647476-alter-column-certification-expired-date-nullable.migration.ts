import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterColumnCertificationExpiredDateNullable1658383647476 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "FarmProfile" ALTER "certificationExpiredDate" DROP NOT NULL;`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "FarmProfile" ALTER "certificationExpiredDate" SET NOT NULL;`);
    }
}
