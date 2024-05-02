import { BaseSeeder } from '~core/seeders/base-seeder';
import { factory } from '@diginexhk/nestjs-seeder';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import roles from '~role-permissions/databases/data/roles.json';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';

export class RoleSeed extends BaseSeeder {
    async run() {
        await Promise.all(
            roles.map(({ id, name }) => factory(RoleEntity).saveOne({ id: id, name: name as UserRoleEnum }))
        );
    }
}
