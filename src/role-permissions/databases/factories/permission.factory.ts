import { plainToClassFromExist } from 'class-transformer';
import { define } from '@diginexhk/nestjs-seeder';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { PermissionSeedingOptionsType } from '~role-permissions/types/permission-seeding-options.type';

define(PermissionEntity, (options: PermissionSeedingOptionsType) => {
    const { id, name, action } = options;

    const permission = new PermissionEntity();
    permission.id = id;
    permission.name = name;
    permission.action = action;

    return plainToClassFromExist(permission, options || {}, {});
});
