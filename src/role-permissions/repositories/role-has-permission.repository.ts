import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { RoleHasPermissionEntity } from '~role-permissions/entities/role-has-permission.entity';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';

@CustomRepository(RoleHasPermissionEntity)
export class RoleHasPermissionRepository extends BaseRepository<RoleHasPermissionEntity> {
    public async deleteUnusedPermissions(roleId: string, assignedPermissionIds: string[]) {
        await this.createQueryBuilder('RoleHasPermission')
            .delete()
            .where({ roleId })
            .andWhere('permissionId NOT IN (:...assignedPermissionIds)', {
                assignedPermissionIds
            })
            .execute();
    }

    findRoleHasPermissionByAction(action: PermissionEnum): Promise<RoleHasPermissionEntity[]> {
        return this.createQueryBuilder('RoleHasPermission')
            .select(['"roleId"'])
            .innerJoin('RoleHasPermission.permission', 'permission')
            .where('permission.action = :action', { action })
            .getRawMany();
    }

    existsRoleHasPermission(actions: PermissionEnum[]): Promise<boolean> {
        return this.createQueryBuilder('RoleHasPermission')
            .innerJoin('RoleHasPermission.permission', 'permission')
            .innerJoin('RoleHasPermission.role', 'roles')
            .where('permission.action IN (:...actions)', { actions })
            .getExists();
    }
}
