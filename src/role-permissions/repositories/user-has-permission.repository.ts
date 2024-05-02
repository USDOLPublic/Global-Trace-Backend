import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { UserHasPermissionEntity } from '~role-permissions/entities/user-has-permission.entity';

@CustomRepository(UserHasPermissionEntity)
export class UserHasPermissionRepository extends BaseRepository<UserHasPermissionEntity> {}
