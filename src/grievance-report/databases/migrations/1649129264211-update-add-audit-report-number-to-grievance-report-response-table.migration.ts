import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { keyBy } from 'lodash';

export class UpdateAddAuditReportNumberToGrievanceReportResponseTable1649129264211 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const responseByResponseId = await this.mapResponsesById(queryRunner);

        await queryRunner.manager.query(`ALTER TABLE "GrievanceReportResponse" DROP COLUMN IF EXISTS "uploadImage";`);
        await this.update('GrievanceReportResponse', (table) => {
            table.string('auditReportNumber').nullable();
            table.jsonb('uploadImages').default("'{}'::jsonb");
        });

        await this.migrateOldUploadImageColumn(responseByResponseId, queryRunner);
    }

    private async migrateOldUploadImageColumn(responseByResponseId, queryRunner: QueryRunner) {
        if (responseByResponseId) {
            for (const responseId of Object.keys(responseByResponseId)) {
                const uploadImages = `["${responseByResponseId[responseId].uploadImage}"]`;
                await queryRunner.query(
                    `UPDATE "GrievanceReportResponse" SET "uploadImages" = '${uploadImages}' WHERE "id" = '${responseId}'`
                );
            }
        }
    }

    private async mapResponsesById(queryRunner: QueryRunner) {
        const responses = await queryRunner.query(
            `SELECT * FROM "GrievanceReportResponse" WHERE "uploadImage" IS NOT NULL`
        );

        return keyBy(responses, 'id');
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('GrievanceReportResponse', (table) => {
            table.string('uploadImage').nullable();
        });
        await queryRunner.manager.query(`ALTER TABLE "GrievanceReportResponse" DROP COLUMN IF EXISTS "uploadImages";`);
        await queryRunner.manager.query(
            `ALTER TABLE "GrievanceReportResponse" DROP COLUMN IF EXISTS "auditReportNumber";`
        );
    }
}
