import format from 'pg-format';
import { SystemRoleType } from '~role-permissions/types/system-role.type';

export const getInsertRoleQueryHelper = (roles: SystemRoleType[]) => {
    let query = 'INSERT INTO "Role" ("id", "name") VALUES %L';
    const values = roles.map((role) => Object.values(role));
    return format(query, values);
};
