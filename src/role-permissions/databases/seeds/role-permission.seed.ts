import { BaseSeeder } from '~core/seeders/base-seeder';
import { factory } from '@diginexhk/nestjs-seeder';
import permissions from '~role-permissions/databases/data/permissions.json';
import systemRoles from '~role-permissions/databases/data/roles.json';
import { RoleHasPermissionEntity } from '~role-permissions/entities/role-has-permission.entity';
import { ROLE_PERMISSION_MAPPING } from '~role-permissions/constants/role-permission-mapping.constant';
import { RolePermissionSeedingOptionsType } from '~role-permissions/types/role-permission-seeding-options.type';
import { RoleHasPermissionRepository } from '~role-permissions/repositories/role-has-permission.repository';

export class RolePermissionSeed extends BaseSeeder {
    private getRolePermissionMapping = (action) => ROLE_PERMISSION_MAPPING.find((item) => item.action === action);

    private isExistRolePermissionPair(roleId: string, permissionId: string) {
        return RoleHasPermissionRepository.make().findOneBy({ roleId, permissionId });
    }

    async run() {
        const rolePermissions: RolePermissionSeedingOptionsType[] = [];
        for (const permission of permissions) {
            const { roles } = this.getRolePermissionMapping(permission.action);
            for (const role of roles) {
                const matchedRole = systemRoles.find((systemRole) => systemRole.name === role);
                const roleId = matchedRole.id;
                const permissionId = permission.id;

                if (!(await this.isExistRolePermissionPair(roleId, permissionId))) {
                    rolePermissions.push({
                        roleId,
                        permissionId
                    });
                }
            }
        }
        await Promise.all(
            rolePermissions.map(({ roleId, permissionId }) =>
                factory(RoleHasPermissionEntity).saveOne({ roleId, permissionId })
            )
        );
    }
}
