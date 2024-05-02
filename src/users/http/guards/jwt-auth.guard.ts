import { CACHE_MANAGER, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Cache } from 'cache-manager';
import { ExtractJwt } from 'passport-jwt';
import { UserStatusEnum } from '~users/enums/user-status.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (!(await super.canActivate(context))) {
            return false;
        }
        const request = context.switchToHttp().getRequest();
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(context.switchToHttp().getRequest());
        const tokenInBlackList = await this.cacheManager.get(token);

        if (tokenInBlackList) {
            throw new UnauthorizedException({ translate: 'error.unauthorized' });
        }

        if (request.user.status !== UserStatusEnum.ACTIVE) {
            throw new UnauthorizedException({ translate: 'error.unauthorized' });
        }

        if (!request.user.role) {
            throw new UnauthorizedException({ translate: 'error.not_assign_role' });
        }

        return true;
    }
}
