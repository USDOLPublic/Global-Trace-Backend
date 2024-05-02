import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import rolePermissions from '~role-permissions/databases/data/role-permissions-04-08-2022-v1.json';
import { getInsertRolePermissionsQueryHelper } from '../helpers/get-insert-role-permissions-query.helper';

export class AssignPermissionCalculationRoleMill1649389820723 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(getInsertRolePermissionsQueryHelper(rolePermissions));
    }

    async rollback(queryRunner: QueryRunner) {
        const rolePermissionIds = rolePermissions.map(({ id }) => `'${id}'`);
        await queryRunner.query(`DELETE FROM "RoleHasPermission" WHERE "id" IN (${rolePermissionIds});`);
    }
}
