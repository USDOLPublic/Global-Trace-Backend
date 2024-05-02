import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnStatusAndPriorityToGrievanceReportTable1680232771825 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.strings('uploadFiles').default('array[]::uuid[]');
            table.integer('status').nullable();
            table.integer('priority').nullable();
        });

        await queryRunner.manager.query(
            'UPDATE "GrievanceReport" SET "uploadFiles" = ARRAY["uploadImage"] WHERE "uploadImage" IS NOT NULL'
        );

        await this.update('GrievanceReport', (table) => {
            table.dropColumn('uploadImage');
            table.dropColumn('indicator');
            table.dropColumn('severity');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('GrievanceReport', (table) => {
            table.string('uploadImage').nullable();
            table.string('indicator').nullable();
            table.string('severity').nullable();
        });

        await queryRunner.manager.query(
            'UPDATE "GrievanceReport" SET "uploadImage" = "uploadFiles"[1] WHERE CARDINALITY("uploadFiles") > 0'
        );

        await this.update('Equivalent', (table) => {
            table.dropColumn('uploadFiles');
            table.dropColumn('status');
            table.dropColumn('priority');
        });
    }
}
