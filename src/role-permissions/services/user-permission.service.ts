import { Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { FindOptionsWhere, In } from 'typeorm';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { UserHasPermissionEntity } from '~role-permissions/entities/user-has-permission.entity';
import { PermissionRepository } from '~role-permissions/repositories/permission.repository';
import { UserHasPermissionRepository } from '~role-permissions/repositories/user-has-permission.repository';
import { UserEntity } from '~users/entities/user.entity';

@Injectable()
export class UserPermissionService {
    public constructor(
        private permissionRepo: PermissionRepository,
        private userHasPermissionRepo: UserHasPermissionRepository
    ) {}

    async assignPermissions(user: UserEntity, ...permissions: (string | PermissionEntity)[]): Promise<void> {
        const permissionEntities = await Promise.all(
            permissions.map((permission) => this.getStoredPermission(permission))
        );
        const permissionIds = permissionEntities.filter((permission) => !isEmpty(permission)).map(({ id }) => id);
        await this.sync(user, permissionIds, false);

        await this.loadUserPermissions(user);
    }

    async syncPermissions(user: UserEntity, ...permissions: (string | PermissionEntity)[]): Promise<void> {
        await this.detach(user);
        await this.assignPermissions(user, ...permissions);
    }

    async removePermission(user: UserEntity, permission: string | PermissionEntity): Promise<void> {
        const permissionEntity = await this.getStoredPermission(permission);
        if (permissionEntity) {
            await this.detach(user, [permissionEntity.id]);
        }

        await this.loadUserPermissions(user);
    }

    private async detach(user: UserEntity, permissionIds: string[] = []): Promise<void> {
        const condition: FindOptionsWhere<UserHasPermissionEntity> = { userId: user.id };

        if (permissionIds.length) {
            condition.permissionId = In(permissionIds);
        }

        await this.userHasPermissionRepo.delete(condition);
    }

    private async sync(user: UserEntity, permissionIds: string[], detaching: boolean): Promise<void> {
        const currentPermissionIds = (await this.userHasPermissionRepo.findBy({ userId: user.id })).map(
            ({ permissionId }) => permissionId
        );

        if (detaching) {
            const detachedIds = currentPermissionIds.filter((id) => !permissionIds.includes(id));
            if (detachedIds.length) {
                await this.userHasPermissionRepo.delete({ userId: user.id, permissionId: In(detachedIds) });
            }
        }

        const attachedIds = permissionIds.filter((id) => !currentPermissionIds.includes(id));
        if (attachedIds.length) {
            await this.userHasPermissionRepo.insert(
                attachedIds.map((permissionId) => ({ permissionId, userId: user.id }))
            );
        }
    }

    private getStoredPermission(permission: string | PermissionEntity): PermissionEntity | Promise<PermissionEntity> {
        if (isEmpty(permission)) {
            return;
        }

        if (permission instanceof PermissionEntity) {
            return permission;
        }

        return this.permissionRepo.findOneByOrFail({ name: permission });
    }

    private async loadUserPermissions(user: UserEntity): Promise<void> {
        user.permissions = await this.permissionRepo.getPermissionsOfUser(user);
    }
}
