import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { ROLE_PERMISSION_MAPPING } from '~role-permissions/constants/role-permission-mapping.constant';
import permissions from '~role-permissions/databases/data/permissions.json';
import systemRoles from '~role-permissions/databases/data/roles.json';
import { getInsertRolePermissionQueryHelper } from '~role-permissions/databases/helpers/get-insert-role-permission-query.helper';
import { RoleSeedingOptionsType } from '~role-permissions/types/role-seeding-options.type';

export class CreateSystemRolePermissionData1645457490446 extends BaseMigration {
    private getRolePermissionMapping = (action) => ROLE_PERMISSION_MAPPING.find((item) => item.action === action);

    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            getInsertRolePermissionQueryHelper(permissions, systemRoles as RoleSeedingOptionsType[])
        );
    }

    async rollback(queryRunner: QueryRunner) {
        for (const permission of permissions) {
            const { roles } = this.getRolePermissionMapping(permission.action);
            for (const role of roles) {
                const matchedRole = systemRoles.find((systemRole) => systemRole.name === role);

                await queryRunner.query(
                    `DELETE FROM "RoleHasPermission" WHERE "roleId" = '${matchedRole.id}' AND "permissionId" = '${permission.id}'`
                );
            }
        }
    }
}
