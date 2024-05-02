import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserRepository } from '../repositories/user.repository';
import { env } from '~config/env.config';
import { MailService } from '@diginexhk/nestjs-mailer';
import { ResetPasswordMail } from '../mails/reset-password.mail';
import bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { OtpService } from './otp.service';
import { PRODUCT_NAME } from '~core/constants/product-name.constant';
import { RolePermissionService } from '~role-permissions/services/role-permission.service';
import { OtpTokenEnum } from '~users/enums/otp-token.enum';
import { RoleService } from '~role-permissions/services/role.service';

@Injectable()
export class ResetPasswordService {
    public constructor(
        private userRepo: UserRepository,
        private userService: UserService,
        private otpService: OtpService,
        private mailService: MailService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private rolePermissionService: RolePermissionService,
        private roleService: RoleService
    ) {}

    async requestNewToken(email: string) {
        const user = await this.userService.findUserByEmail(email, {
            select: ['id', 'firstName', 'lastName'],
            relations: ['role', 'role.permissions', 'permissions']
        });
        if (user) {
            await this.roleService.checkUserCanResetPassword(user);

            const otp = await this.otpService.generateNewOtp(user, env.FORGOT_PASSWORD_TTL);

            let resetLink = `${env.WEB_URL}/reset-password?token=${otp.token}`;
            resetLink = await this.userService.generateDynamicLink(resetLink);

            await this.mailService.addToQueue(new ResetPasswordMail(user, resetLink, email, PRODUCT_NAME));
        }
    }

    async resetPassword(password: string, token: string) {
        const otp = await this.otpService.checkToken(token);
        const user = await this.otpService.getUserInformationByToken(token, OtpTokenEnum.RESET_PASSWORD);
        await this.roleService.checkUserCanResetPassword(user);

        await this.otpService.deactivateOldTokens(user);
        await this.userRepo.update(otp.user.id, { password: bcrypt.hashSync(password, env.SALT_ROUND) });
    }
}
