import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnCreatorIdToGrievanceReportTable1648782807179 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.uuid('creatorId').index().nullable();
        });

        await queryRunner.query(
            `UPDATE "GrievanceReport" SET "creatorId" = (SELECT "id" FROM "User" WHERE "email" = 'admin@usdol.com');`
        );

        await queryRunner.query('ALTER TABLE "GrievanceReport" ALTER "creatorId" SET NOT NULL;');
        await queryRunner.query('ALTER TABLE "GrievanceReport" ALTER "assigneeId" DROP NOT NULL;');
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.dropColumn('creatorId');
        });
        await queryRunner.query('ALTER TABLE "GrievanceReport" ALTER "assigneeId" SET NOT NULL;');
    }
}
