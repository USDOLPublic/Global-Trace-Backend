import { ROLE_PERMISSION_MAPPING } from '~role-permissions/constants/role-permission-mapping.constant';
import { SystemPermissionType } from '~role-permissions/types/system-permission.type';
import { RoleSeedingOptionsType } from '~role-permissions/types/role-seeding-options.type';
import format from 'pg-format';

export function getRolePermissionMapping(action) {
    return ROLE_PERMISSION_MAPPING.find((item) => item.action === action);
}

export function getInsertRolePermissionQueryHelper(
    permissions: SystemPermissionType[],
    systemRoles: RoleSeedingOptionsType[]
) {
    const values = [];
    for (const permission of permissions) {
        const { roles } = getRolePermissionMapping(permission.action);
        for (const role of roles) {
            const matchedRole = systemRoles.find((systemRole) => systemRole.name === role);

            if (matchedRole) {
                values.push([matchedRole.id, permission.id]);
            }
        }
    }

    return format('INSERT INTO "RoleHasPermission" ("roleId", "permissionId") VALUES %L', values);
}
