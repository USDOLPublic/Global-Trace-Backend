import { CACHE_MANAGER, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';
import { Cache } from 'cache-manager';
import { UserService } from '~users/services/user.service';
import { SHORT_TOKEN } from '~users/constants/short-token.constant';
import { FacilityService } from '~facilities/services/facility.service';

@Injectable()
export class ShortTokenStrategy extends PassportStrategy(Strategy, SHORT_TOKEN) {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private userService: UserService,
        private facilityService: FacilityService
    ) {
        super();
    }

    async authenticate(req: any) {
        const shortToken = req.query.shortToken;
        try {
            const cachedUserId = (await this.cacheManager.get(shortToken)) as string;
            if (!cachedUserId) {
                return this.fail(null, undefined);
            }

            const user = await this.userService.findByIdNotFail(cachedUserId);
            if (!user) {
                return this.fail(null, undefined);
            }
            user.currentFacility = await this.facilityService.findFacilityOfUser(user);

            this.success(user);
        } catch (error) {
            this.error(new UnauthorizedException({ translate: 'error.unauthorized' }));
        }
    }
}
