import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import rolePermissions from '~role-permissions/databases/data/role-permissions-04-06-2022-v1.json';
import { getInsertRolePermissionsQueryHelper } from '~role-permissions/databases/helpers/get-insert-role-permissions-query.helper';

export class UpdatePermissionsForRoleSupplier1649212078247 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(getInsertRolePermissionsQueryHelper(rolePermissions));
    }

    async rollback(queryRunner: QueryRunner) {
        const rolePermissionIds = rolePermissions.map(({ id }) => `'${id}'`);
        await queryRunner.query(`DELETE FROM "RoleHasPermission" WHERE "id" IN (${rolePermissionIds});`);
    }
}
