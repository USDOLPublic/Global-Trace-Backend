import { ExecutionContext } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { UuidException } from '@diginexhk/nestjs-exception';
import { UserEntity } from '~users/entities/user.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';

export class BaseGuard {
    getUserFromContext(context: ExecutionContext): UserEntity {
        const request = context.switchToHttp().getRequest();
        return request.user;
    }

    getId(context: ExecutionContext, key = 'id') {
        let request = context.switchToHttp().getRequest();
        let id = request.params[key];
        if (!isUUID(id)) {
            throw new UuidException(key);
        }

        return id;
    }

    getUserRoleFromContext(context: ExecutionContext): RoleEntity {
        const request = context.switchToHttp().getRequest();
        return request.user.role;
    }

    getUserPermissionsFromContext(context: ExecutionContext): PermissionEntity[] {
        const request = context.switchToHttp().getRequest();
        return request.user.permissions;
    }
}
