import { plainToClassFromExist } from 'class-transformer';
import { define } from '@diginexhk/nestjs-seeder';
import { RolePermissionSeedingOptionsType } from '~role-permissions/types/role-permission-seeding-options.type';
import { RoleHasPermissionEntity } from '~role-permissions/entities/role-has-permission.entity';

define(RoleHasPermissionEntity, (options: RolePermissionSeedingOptionsType) => {
    const { roleId, permissionId } = options;

    const roleHasPermission = new RoleHasPermissionEntity();
    roleHasPermission.roleId = roleId;
    roleHasPermission.permissionId = permissionId;

    return plainToClassFromExist(roleHasPermission, options || {}, {});
});
