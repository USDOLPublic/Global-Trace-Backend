import format from 'pg-format';
import { SystemPermissionType } from '~role-permissions/types/system-permission.type';

export const getInsertPermissionQueryHelper = (permissions: SystemPermissionType[]) => {
    let query = 'INSERT INTO "Permission" ("id", "group", "action", "name") VALUES %L';
    const values = permissions.map((permission) => Object.values(permission));
    return format(query, values);
};
