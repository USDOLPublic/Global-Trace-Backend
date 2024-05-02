import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { BaseGuard } from '~core/http/guards/base.guard';
import { TRANSFORMATION_PARTNER_ROLES } from '~role-permissions/constants/roles.constant';

@Injectable()
export class TransformationPartnerGuard extends BaseGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const role = this.getUserRoleFromContext(context);

        return TRANSFORMATION_PARTNER_ROLES.includes(role.name);
    }
}
