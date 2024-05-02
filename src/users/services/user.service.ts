import { ValidateException, ValidateFieldException } from '@diginexhk/nestjs-exception';
import { MailService } from '@diginexhk/nestjs-mailer';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BaseQuery } from '@diginexhk/typeorm-helper';
import { Global, Inject, Injectable, forwardRef } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { FindManyOptions, FindOneOptions, ILike, In, Not } from 'typeorm';
import { env } from '~config/env.config';
import { PRODUCT_NAME } from '~core/constants/product-name.constant';
import { DynamicLinkService } from '~dynamic-link/services/dynamic-link.service';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleService } from '~role-permissions/services/role.service';
import { InviteUserMail } from '~users/mails/invite-user.mail';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { OtpService } from './otp.service';

@Global()
@Injectable()
export class UserService extends TransactionService {
    public constructor(
        private userRepo: UserRepository,
        private roleService: RoleService,
        @Inject(forwardRef(() => OtpService)) private otpService: OtpService,
        private dynamicLinkService: DynamicLinkService,
        private mailService: MailService
    ) {
        super();
    }

    count(options?: FindManyOptions<UserEntity> | BaseQuery<UserEntity>): Promise<number> {
        return this.userRepo.count(options);
    }

    findUserById(id, options?: FindOneOptions<UserEntity>) {
        return this.userRepo.findUserById(id, options);
    }

    findUserByEmail(email: string, options?: FindOneOptions<UserEntity>) {
        return this.userRepo.findByEmail(email, options);
    }

    findByIdNotFail(id: string) {
        return this.userRepo.findOne({
            where: { id },
            relations: [
                'role',
                'role.permissions',
                'role.hasPermissions',
                'permissions',
                'permissions.roles',
                'facilities',
                'role.selfAssessmentUploadFiles'
            ]
        });
    }

    findOneOrFail(options?: FindOneOptions<UserEntity>): Promise<UserEntity> {
        return this.userRepo.findOneOrFail(options);
    }

    findOneNotFail(options?: FindOneOptions<UserEntity>): Promise<UserEntity> {
        return this.userRepo.findOne(options);
    }

    async changePassword(userId: string, newPassword: string, oldPassword: string) {
        const user = await this.userRepo.findById(userId, { select: ['id', 'password'] });

        if (!bcrypt.compareSync(oldPassword, user.password)) {
            throw new ValidateFieldException('oldPassword', 'incorrect_old_password', 'wrongPass');
        }

        if (oldPassword === newPassword) {
            throw new ValidateFieldException('oldPassword', 'duplicate_old_password', 'wrongPass');
        }

        await this.userRepo.update(user.id, { password: bcrypt.hashSync(newPassword, env.SALT_ROUND) });
    }

    update(id: string, data: Partial<UserEntity>) {
        return this.userRepo.update(id, data);
    }

    findByIds(ids: string[]): Promise<UserEntity[]> {
        return this.userRepo.findBy({ id: In(ids) });
    }

    async generateDynamicLink(link: string): Promise<string> {
        const { url } = await this.dynamicLinkService.createShortDynamicLink(link);
        return url;
    }

    async sendInvitationMail(user: UserEntity, invitedUser: UserEntity | undefined) {
        const isVerified = !isEmpty(invitedUser) && (await this.roleService.canUserLogin(user));

        if (!isVerified) {
            return;
        }

        const otp = await this.otpService.generateNewOtp(invitedUser, env.INVITE_USER_TTL);
        let signUpLink = `${env.WEB_URL}/sign-up?invite-token=${otp.token}`;
        signUpLink = await this.generateDynamicLink(signUpLink);

        return this.mailService.addToQueue(new InviteUserMail(user, invitedUser, signUpLink, PRODUCT_NAME));
    }

    async assignRole(user: UserEntity, role: UserRoleEnum) {
        const roleEntity = await this.roleService.findRoleByName(role);

        return this.userRepo.addRole(user, roleEntity);
    }

    async changeSupplierRole(user: UserEntity, roleId: string) {
        const role = await this.roleService.findRoleById(roleId);
        await this.userRepo.update(user.id, { roleId: role.id });
    }

    updateUserInformation(id: string, userData: Partial<UserEntity> = {}) {
        userData.updatedProfileAt = moment().toDate();
        return this.userRepo.updateOrFail({ id }, userData);
    }

    async finishGuidance(user: UserEntity) {
        await this.userRepo.update(user.id, {
            finishedGuidanceAt: moment().toDate()
        });
    }

    createOne(data: Partial<UserEntity>) {
        return this.userRepo.save(data);
    }

    async validateUniqueEmail(userId: string, email: string) {
        const isExists = await this.userRepo.exists({ id: Not(userId), email: ILike(email) });
        if (isExists) {
            throw new ValidateException([
                {
                    property: 'email',
                    constraints: {
                        invalidField: { message: 'The email has already been taken.', detail: {} } as any
                    }
                }
            ]);
        }
    }

    updateAnsweredSaqAt(user: UserEntity) {
        return this.userRepo.update(user.id, { answeredSaqAt: moment().toDate() });
    }
}
