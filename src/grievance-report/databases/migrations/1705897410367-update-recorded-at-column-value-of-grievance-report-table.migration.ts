import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateRecordedAtColumnValueOfGrievanceReportTable1705897410367 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(
            'UPDATE "GrievanceReport" SET "recordedAt" = "createdAt" WHERE "recordedAt" IS NULL;'
        );
    }
}
