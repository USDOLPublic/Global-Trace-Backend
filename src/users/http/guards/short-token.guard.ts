import { CACHE_MANAGER, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Cache } from 'cache-manager';
import { SHORT_TOKEN } from '~users/constants/short-token.constant';
import { UserStatusEnum } from '~users/enums/user-status.enum';

@Injectable()
export class ShortTokenGuard extends AuthGuard(SHORT_TOKEN) {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (!(await super.canActivate(context))) {
            return false;
        }

        const request = context.switchToHttp().getRequest();
        return request.user.status === UserStatusEnum.ACTIVE;
    }
}
