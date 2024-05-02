import roles from '~role-permissions/databases/data/roles.json';
import { find, map } from 'lodash';
import faker from 'faker';

export const getRoleIdByRoleName = (roleName?: string) => {
    if (roleName) {
        const role = find(roles, { name: roleName });
        return role.id;
    }

    const roleIds = map(roles, 'id');
    return faker.random.arrayElement(roleIds);
};
