import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddRoleIdToSelfAssessmentUploadFileTable1697204786209 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentUploadFile', (table) => {
            table.uuid('roleId').index().nullable().foreign('Role');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentUploadFile', (table) => {
            table.dropColumn('roleId');
        });
    }
}
