import { BaseSeeder } from '~core/seeders/base-seeder';
import { factory } from '@diginexhk/nestjs-seeder';
import permissions from '~role-permissions/databases/data/permissions.json';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';

export class PermissionSeed extends BaseSeeder {
    async run() {
        await Promise.all(
            permissions.map(({ id, name, action }) => factory(PermissionEntity).saveOne({ id, name, action }))
        );
    }
}
