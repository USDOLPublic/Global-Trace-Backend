import { upperFirst } from 'lodash';
import { NON_PARTICIPATING } from '~facilities/constants/facility-type-name.constant';
import { RoleEntity } from '~role-permissions/entities/role.entity';

export function getFacilityTypeName(type: string, role: RoleEntity) {
    switch (type) {
        case null:
        case undefined:
            return `${NON_PARTICIPATING} ${upperFirst(role.name.replace('_', ' ').toLowerCase())}`;

        default: {
            return upperFirst(type.replace('_', ' ').toLowerCase());
        }
    }
}
