import { CustomRepository } from '@diginexhk/typeorm-helper';
import { FindOneOptions, SelectQueryBuilder } from 'typeorm';
import { BaseRepository } from '~core/repositories/base.repository';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { PermissionGroupCount } from '~role-permissions/types/permission-group-count.type';
import { UserEntity } from '~users/entities/user.entity';

@CustomRepository(PermissionEntity)
export class PermissionRepository extends BaseRepository<PermissionEntity> {
    findByAction(action: string, options?: FindOneOptions<PermissionEntity>) {
        return this.find({ where: { action }, ...options, relations: options?.relations || ['roles'] });
    }

    findById(id: string, options?: FindOneOptions<PermissionEntity>) {
        return this.findOneOrFail({
            where: { id },
            ...options,
            relations: options?.relations || ['roles']
        });
    }

    getPermissionsOfUser(user: UserEntity): Promise<PermissionEntity[]> {
        return this.createQueryBuilder('Permission')
            .innerJoin('UserHasPermission', 'UserHasPermission', 'UserHasPermission.permissionId = Permission.id')
            .where('UserHasPermission.userId = :userId', { userId: user.id })
            .getMany();
    }

    countPermissionsByGroup(): Promise<PermissionGroupCount[]> {
        return this.manager
            .createQueryBuilder()
            .from((queryBuilder): SelectQueryBuilder<any> => {
                return queryBuilder
                    .subQuery()
                    .from(PermissionEntity, 'permission')
                    .select('id')
                    .addSelect(`UNNEST(STRING_TO_ARRAY(groups, ','))`, 'group');
            }, 'permissionGroup')
            .select('"group"')
            .addSelect('COUNT(*)::INT', 'totalPermissions')
            .groupBy('"group"')
            .getRawMany();
    }
}
