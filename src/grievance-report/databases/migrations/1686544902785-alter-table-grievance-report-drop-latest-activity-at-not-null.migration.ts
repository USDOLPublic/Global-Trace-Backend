import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterTableGrievanceReportDropLatestActivityAtNotNull1686544902785 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query('ALTER TABLE "GrievanceReport" ALTER "latestActivityAt" DROP NOT NULL;');
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query('ALTER TABLE "GrievanceReport" ALTER "latestActivityAt" SET NOT NULL;');
    }
}
