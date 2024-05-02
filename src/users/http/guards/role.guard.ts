import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { BaseGuard } from '~core/http/guards/base.guard';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';

export function RoleGuard(...roles: UserRoleEnum[]): { new (): BaseGuard } {
    @Injectable()
    class RoleCheck extends BaseGuard implements CanActivate {
        constructor(private rolePermissionService: RolePermissionService) {
            super();
        }

        canActivate(context: ExecutionContext): boolean {
            const user = context.switchToHttp().getRequest().user;

            return this.rolePermissionService.hasAnyRoles(user, roles);
        }
    }

    return RoleCheck as unknown as { new (): BaseGuard };
}
