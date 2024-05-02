import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import {
    getInsertRolePermissionQueryHelper,
    getRolePermissionMapping
} from '~role-permissions/databases/helpers/get-insert-role-permission-query.helper';
import permissions from '~role-permissions/databases/data/permissions-03-28-2022-v1.json';
import systemRoles from '~role-permissions/databases/data/roles.json';
import { RoleSeedingOptionsType } from '~role-permissions/types/role-seeding-options.type';

export class AddInviteSupplierRolePermission1648442882708 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            getInsertRolePermissionQueryHelper(permissions, systemRoles as RoleSeedingOptionsType[])
        );
    }

    async rollback(queryRunner: QueryRunner) {
        for (const permission of permissions) {
            const { roles } = getRolePermissionMapping(permission.action);
            for (const role of roles) {
                const matchedRole = systemRoles.find((systemRole) => systemRole.name === role);

                await queryRunner.query(
                    `DELETE FROM "RoleHasPermission" WHERE "roleId" = '${matchedRole.id}' AND "permissionId" = '${permission.id}'`
                );
            }
        }
    }
}
