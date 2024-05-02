import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdatePermissionName1706069823901 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `UPDATE "Permission" SET "name" = 'Assign DNA Identifier' WHERE "action" = 'ASSIGN_DNA';`
        );

        await queryRunner.query(
            `UPDATE "Permission" SET "name" = 'Submit incident reports' WHERE "action" = 'SUBMIT_GRIEVANCE_REPORTS';`
        );

        await queryRunner.query(
            `UPDATE "Permission" SET "name" = 'Submit incident reports' WHERE "action" = 'SUBMIT_REPORTS';`
        );

        await queryRunner.query(
            `UPDATE "Permission" SET "name" = 'View incident reports' WHERE "action" = 'VIEW_REPORTS';`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`UPDATE "Permission" SET "name" = 'Assign DNA' WHERE "action" = 'ASSIGN_DNA';`);

        await queryRunner.query(
            `UPDATE "Permission" SET "name" = 'Submit grievance reports' WHERE "action" = 'SUBMIT_GRIEVANCE_REPORTS';`
        );

        await queryRunner.query(`UPDATE "Permission" SET "name" = 'Submit reports' WHERE "action" = 'SUBMIT_REPORTS';`);

        await queryRunner.query(`UPDATE "Permission" SET "name" = 'View reports' WHERE "action" = 'VIEW_REPORTS';`);
    }
}
