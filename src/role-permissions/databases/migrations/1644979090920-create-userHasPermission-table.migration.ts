import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateUserHasPermissionTable1644979090920 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('UserHasPermission', (table) => {
            table.primaryUuid('id');
            table.uuid('userId').index().foreign('User');
            table.uuid('permissionId').index().foreign('Permission');
            table.baseTime();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('UserHasPermission');
    }
}
