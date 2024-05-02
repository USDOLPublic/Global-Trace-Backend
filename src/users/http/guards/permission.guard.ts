import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { BaseGuard } from '~core/http/guards/base.guard';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';

export function PermissionGuard(...permissions: string[]): { new (): BaseGuard } {
    @Injectable()
    class PermissionCheck extends BaseGuard implements CanActivate {
        constructor(private rolePermissionService: RolePermissionService) {
            super();
        }

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const user = context.switchToHttp().getRequest().user;
            return this.rolePermissionService.hasAnyPermissions(user, permissions);
        }
    }

    return PermissionCheck as unknown as { new (): BaseGuard };
}
