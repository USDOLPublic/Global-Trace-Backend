import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnLatestActivityAtToGrievanceReportTable1662523883978 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.timestamp('latestActivityAt').nullable();
        });

        await queryRunner.query(
            `UPDATE "GrievanceReport"
            SET "latestActivityAt" = "tmp"."latestActivityAt"
            FROM (
                SELECT "grievanceReportId", MAX("GrievanceReportResponse"."recordedAt") "latestActivityAt"
                FROM "GrievanceReportResponse"
                GROUP BY "GrievanceReportResponse"."grievanceReportId"
            ) "tmp"
            WHERE "GrievanceReport"."id" = "tmp"."grievanceReportId";`
        );

        await queryRunner.query(
            `UPDATE "GrievanceReport"
            SET "latestActivityAt" = "recordedAt"
            WHERE "source" = 3 AND "latestActivityAt" IS NULL;`
        );

        await queryRunner.query(
            `UPDATE "GrievanceReport"
            SET "latestActivityAt" = "createdAt"
            WHERE "source" = 4 AND "latestActivityAt" IS NULL;`
        );

        await queryRunner.query('ALTER TABLE "GrievanceReport" ALTER "latestActivityAt" SET NOT NULL;');
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.dropColumn('latestActivityAt');
        });
    }
}
