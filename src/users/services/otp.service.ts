import { BadRequestException, forwardRef, GoneException, Inject, Injectable } from '@nestjs/common';
import { makeAToken } from '~core/helpers/string.helper';
import { UserEntity } from '~users/entities/user.entity';
import { OtpRepository } from '~users/repositories/otp.repository';
import moment from 'moment';
import { isExpire } from '~core/helpers/time.helper';
import { UserService } from '~users/services/user.service';
import { OtpTokenEnum } from '~users/enums/otp-token.enum';

@Injectable()
export class OtpService {
    public constructor(
        private otpRepo: OtpRepository,
        @Inject(forwardRef(() => UserService)) private userService: UserService
    ) {}

    deactivateOldTokens(user: UserEntity) {
        return this.otpRepo.update({ userId: user.id, isValid: true }, { isValid: false });
    }

    async generateNewOtp(user: UserEntity, ttl: number) {
        await this.deactivateOldTokens(user);
        return this.otpRepo.createOne({
            token: await this.createNewToken(),
            user: user,
            expireAt: moment().add(ttl, 'm').toDate()
        });
    }

    async createNewToken() {
        const token = makeAToken();
        if (await this.otpRepo.exists({ token })) {
            return this.createNewToken();
        }

        return token;
    }

    async checkToken(token: string) {
        const otp = await this.otpRepo.findOneOrFail({ where: { token }, relations: ['user'] });
        if (!otp.isValid || isExpire(otp.expireAt)) {
            throw new GoneException({ translate: 'error.token_is_invalid_or_expired' });
        }

        return otp;
    }

    async getUserInformationByToken(token: string, tokenType: OtpTokenEnum = OtpTokenEnum.INVITATION) {
        const otp = await this.checkToken(token);

        const user = await this.userService.findUserById(otp.userId, {
            select: ['id', 'email', 'firstName', 'lastName', 'password', 'createdAt'],
            relations: ['role', 'role.permissions', 'permissions']
        });
        if (tokenType === OtpTokenEnum.INVITATION && user.password) {
            throw new BadRequestException({ translate: 'error.user_signed_up' });
        }
        delete user.password;

        return user;
    }
}
