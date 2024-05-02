import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { UserHasPermissionEntity } from '~role-permissions/entities/user-has-permission.entity';
import { GetAndSearchPermissionQuery } from '~role-permissions/queries/get-and-search-permission.query';
import { PermissionRepository } from '~role-permissions/repositories/permission.repository';
import { UserHasPermissionRepository } from '~role-permissions/repositories/user-has-permission.repository';

@Injectable()
export class PermissionService {
    constructor(
        private permissionRepo: PermissionRepository,
        private userHasPermissionRepo: UserHasPermissionRepository
    ) {}

    findPermissionsByAction(action: string, options?: FindOneOptions<PermissionEntity>) {
        return this.permissionRepo.findByAction(action, options);
    }

    findPermissionsByRoles(roles: RoleEntity[]) {
        return roles.reduce((acc, role) => {
            acc = [...acc, ...role.permissions];
            return acc;
        }, []);
    }

    addPermissionsForUser(userId, permissions: PermissionEntity[]): Promise<UserHasPermissionEntity[]> {
        const userHasPermissions = permissions.map(({ id: permissionId }) =>
            this.userHasPermissionRepo.create({
                userId,
                permissionId
            })
        );

        return this.userHasPermissionRepo.save(userHasPermissions);
    }

    getAllPermissions(roleType?: string): Promise<PermissionEntity[]> {
        return this.permissionRepo.find(new GetAndSearchPermissionQuery({ groupName: roleType }));
    }
}
