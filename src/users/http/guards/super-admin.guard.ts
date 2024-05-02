import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { BaseGuard } from '~core/http/guards/base.guard';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';

@Injectable()
export class SuperAdminGuard extends BaseGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const role = this.getUserRoleFromContext(context);

        return role.name === UserRoleEnum.SUPER_ADMIN;
    }
}
