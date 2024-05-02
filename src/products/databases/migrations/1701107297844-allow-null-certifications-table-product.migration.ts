import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AllowNullCertificationsTableProduct1701107297844 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "Product" ALTER "certifications" DROP NOT NULL;`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "Product" ALTER "certifications" SET NOT NULL;`);
    }
}
