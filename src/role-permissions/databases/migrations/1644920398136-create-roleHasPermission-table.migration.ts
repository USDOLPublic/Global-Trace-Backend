import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateRoleHasPermissionTable1644920398136 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('RoleHasPermission', (table) => {
            table.primaryUuid('id');
            table.uuid('roleId').index().foreign('Role');
            table.uuid('permissionId').index().foreign('Permission');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('RoleHasPermission');
    }
}
