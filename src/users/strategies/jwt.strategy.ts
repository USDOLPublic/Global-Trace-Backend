import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from '~config/env.config';
import { FacilityService } from '~facilities/services/facility.service';
import { UserEntity } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UserService, private facilityService: FacilityService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: env.JWT.SECRET
        });
    }

    async validate(payload: { id: string }): Promise<UserEntity> {
        const user = await this.userService.findByIdNotFail(payload.id);

        if (!user) {
            throw new UnauthorizedException({ translate: 'error.unauthorized' });
        }

        user.currentFacility = await this.facilityService.findFacilityOfUser(user);

        return user;
    }
}
