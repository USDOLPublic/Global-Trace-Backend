import { SeederModule } from '@diginexhk/nestjs-seeder';
import { UserSeed } from '~users/databases/seeds/user.seed';
import { RoleSeed } from '~role-permissions/databases/seeds/role.seed';
import { PermissionSeed } from '~role-permissions/databases/seeds/permission.seed';
import { RolePermissionSeed } from '~role-permissions/databases/seeds/role-permission.seed';

export const seedConfig = SeederModule.forRoot([RoleSeed, PermissionSeed, RolePermissionSeed, UserSeed]);
