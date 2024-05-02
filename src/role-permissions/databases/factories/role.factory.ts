import { plainToClassFromExist } from 'class-transformer';
import { define } from '@diginexhk/nestjs-seeder';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { RoleSeedingOptionsType } from '~role-permissions/types/role-seeding-options.type';

define(RoleEntity, (options: RoleSeedingOptionsType) => {
    const { id, name } = options;

    const role = new RoleEntity();
    role.id = id;
    role.name = name;

    return plainToClassFromExist(role, options || {}, {});
});
