import format from 'pg-format';
import { RolePermissionType } from '~role-permissions/types/role-permission.type';

export const getInsertRolePermissionsQueryHelper = (rolePermissions: RolePermissionType[]) => {
    let query =
        'INSERT INTO "RoleHasPermission" ("id", "roleId", "permissionId") VALUES %L ON CONFLICT ON CONSTRAINT uq_rolehaspermission_roleid_permissionid DO NOTHING';
    const values = rolePermissions.map((rolePermission) => Object.values(rolePermission));
    return format(query, values);
};
