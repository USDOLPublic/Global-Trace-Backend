import { MailService } from '@diginexhk/nestjs-mailer';
import {
    BadRequestException,
    CACHE_MANAGER,
    ForbiddenException,
    Inject,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import _ from 'lodash';
import moment from 'moment';
import { env } from '~config/env.config';
import { PRODUCT_NAME } from '~core/constants/product-name.constant';
import { makeAToken } from '~core/helpers/string.helper';
import { FacilityService } from '~facilities/services/facility.service';
import { RoleService } from '~role-permissions/services/role.service';
import { DEFAULT_CACHING_TTL_SHORT_TOKEN } from '~users/constants/auth.constant';
import { UserEntity } from '~users/entities/user.entity';
import { UserStatusEnum } from '~users/enums/user-status.enum';
import { SignUpUserDto } from '~users/http/dto/sign-up-user.dto';
import { WelcomeUserMail } from '~users/mails/welcome-user.mail';
import { UserService } from '~users/services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { OtpService } from './otp.service';
import { LoginResponseType } from '~users/types/login-response.type';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { BusinessDetailService } from '~site-details/services/business-detail.service';

@Injectable()
export class AuthService {
    public constructor(
        private userRepo: UserRepository,
        private jwtService: JwtService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private userService: UserService,
        private otpService: OtpService,
        private roleService: RoleService,
        private mailService: MailService,
        private facilityService: FacilityService,
        private businessDetailService: BusinessDetailService
    ) {}

    private async checkUserCanLogin(user: UserEntity) {
        if (!user.role) {
            throw new ForbiddenException({ translate: 'error.not_assign_role' });
        }

        const canLogin = this.roleService.canUserLogin(user);

        if (!canLogin) {
            throw new ForbiddenException({ translate: 'error.forbidden' });
        }

        if (user.status === UserStatusEnum.DEACTIVATED) {
            throw new BadRequestException({ translate: 'error.account_was_deactivated' });
        }
    }

    async login(email: string, password: string): Promise<LoginResponseType> {
        const user = await this.userService.findOneNotFail({
            where: { email },
            select: ['id', 'password', 'status'],
            relations: ['role', 'role.permissions', 'permissions', 'permissions.roles']
        });

        if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
            throw new UnauthorizedException({ translate: 'error.email_or_password_wrong' });
        }

        await this.checkUserCanLogin(user);

        await this.updateLastLoginAt(user.id);
        return this.createLoginResult(user.id, email);
    }

    private async verifyRefreshToken(refreshToken: string) {
        const payload = (await this.jwtService.decode(refreshToken)) as any;
        try {
            this.jwtService.verify(refreshToken, { secret: env.JWT.REFRESH_SECRET });
            const blacklistTtl = payload.exp - moment().unix();
            return { payload, blacklistTtl };
        } catch (e) {
            throw new BadRequestException({ translate: 'error.token_is_invalid_or_expired' });
        }
    }

    async refreshToken(refreshToken: string) {
        const { payload, blacklistTtl } = await this.verifyRefreshToken(refreshToken);
        await this.cacheManager.set(refreshToken, 1, blacklistTtl);
        return this.createLoginResult(payload.id, payload.email);
    }

    async createLoginResult(userId: string, email: string): Promise<LoginResponseType> {
        const token = await this.jwtService.signAsync({ id: userId, email });
        const refreshToken = await this.jwtService.signAsync(
            { id: userId, email },
            { secret: env.JWT.REFRESH_SECRET, expiresIn: env.JWT.REFRESH_EXPIRE }
        );

        const user = await this.userService.findUserById(userId);
        await this.checkUserCanLogin(user);

        user.currentFacility = await this.facilityService.findFacilityOfUser(user);
        user.role.uploadedSAQ = user.role.selfAssessmentUploadFiles?.length > 0;

        return {
            user: { ...user, completedConfiguringSystemAt: await this.getConfigureSystemAt(user) },
            token,
            refreshToken,
            expireAt: (this.jwtService.decode(token) as any).exp
        };
    }

    private async getConfigureSystemAt(user: UserEntity): Promise<number | null> {
        if (user.roleName === UserRoleEnum.SUPER_ADMIN) {
            const businessDetail = await this.businessDetailService.getBusinessDetail();

            return businessDetail.completedConfiguringSystemAt;
        }

        return null;
    }

    async getInviteInformation(inviteToken: string) {
        const otp = await this.otpService.checkToken(inviteToken);

        const user = await this.userRepo.findOne({
            where: { id: otp.userId },
            select: ['id', 'email', 'firstName', 'lastName', 'password', 'createdAt'],
            relations: ['role', 'role.permissions', 'permissions']
        });

        if (!user) {
            throw new BadRequestException({ translate: 'error.sign_up_link_invalid' });
        }

        if (user.password) {
            throw new BadRequestException({ translate: 'error.user_signed_up' });
        }

        if (!this.roleService.canUserLogin(user)) {
            throw new ForbiddenException({ translate: 'error.forbidden' });
        }

        delete user.password;

        return user;
    }

    async signup(data: SignUpUserDto) {
        const user = await this.getInviteInformation(data.token);

        await this.otpService.deactivateOldTokens(user);

        user.password = bcrypt.hashSync(data.password, env.SALT_ROUND);
        user.status = UserStatusEnum.ACTIVE;
        user.joinedAt = new Date();
        await user.save();
        delete user.password;

        await this.sendWelcomeMail(user);

        return _.cloneDeepWith(user, (value, key) => {
            if (key === 'joinedAt') return Math.round(+user.joinedAt / 1000);
        });
    }

    async sendWelcomeMail(user) {
        let signInLink = `${env.WEB_URL}/sign-in`;
        signInLink = await this.userService.generateDynamicLink(signInLink);

        await this.mailService.addToQueue(new WelcomeUserMail(user, signInLink, PRODUCT_NAME));
    }

    async logout(token: string) {
        const tokenExpireAt = ((await this.jwtService.decode(token)) as any).exp;
        const blacklistTtl = tokenExpireAt - moment().unix();
        await this.cacheManager.set(token, 1, blacklistTtl);
    }

    async updateLastLoginAt(id) {
        await this.userRepo.update(id, { lastLoginAt: moment.utc() });
    }

    async createShortToken(userId: string) {
        const shortToken = makeAToken();
        await this.cacheManager.set(shortToken, userId, DEFAULT_CACHING_TTL_SHORT_TOKEN);
        return { shortToken };
    }
}
