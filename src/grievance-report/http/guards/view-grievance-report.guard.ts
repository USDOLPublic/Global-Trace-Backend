import { ExecutionContext, Injectable } from '@nestjs/common';
import { BaseGuard } from '~core/http/guards/base.guard';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';
import { UserEntity } from '~users/entities/user.entity';

@Injectable()
export class ViewGrievanceReportGuard extends BaseGuard {
    constructor(private rolePermissionService: RolePermissionService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const user = context.switchToHttp().getRequest().user as UserEntity;

        if (user.role.type === RoleTypeEnum.ADMINISTRATOR) {
            return this.rolePermissionService.hasAnyPermissions(user, [PermissionEnum.SUBMIT_GRIEVANCE_REPORTS]);
        } else {
            return this.rolePermissionService.hasAnyPermissions(user, [
                PermissionEnum.VIEW_ALL_REPORTS,
                PermissionEnum.VIEW_ONLY_MY_REPORTS
            ]);
        }
    }
}
