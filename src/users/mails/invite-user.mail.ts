import { BaseMail } from '@diginexhk/nestjs-mailer';
import path from 'path';
import { env } from '~config/env.config';
import { UserEntity } from '~users/entities/user.entity';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { URDU_LANGUAGE } from '~core/constants/default-language.constant';
import { currentLanguage, trans } from '@diginexhk/nestjs-cls-translation';

export class InviteUserMail extends BaseMail {
    constructor(
        private user: UserEntity,
        private invitedUser: UserEntity,
        private signUpLink: string,
        private productName: string
    ) {
        super();
    }

    get isInviterAdmin() {
        return this.user.roleName === UserRoleEnum.ADMIN;
    }

    get subject(): string {
        if (this.isInviterAdmin) {
            return trans('mail.invite_admin_subject', { args: { productName: this.productName } });
        }

        return trans('mail.invite_user_subject', {
            args: { name: `${this.user.firstName} ${this.user.lastName}`, productName: this.productName }
        });
    }

    get template(): string {
        const language = currentLanguage();
        if (this.isInviterAdmin) {
            if (language === URDU_LANGUAGE) {
                return path.join(env.ROOT_PATH, 'users/resources/mails/admin-invite-user.ur.mail.hbs');
            }
            return path.join(env.ROOT_PATH, 'users/resources/mails/admin-invite-user.mail.hbs');
        }

        if (language === URDU_LANGUAGE) {
            return path.join(env.ROOT_PATH, 'users/resources/mails/user-invite-user.ur.mail.hbs');
        }
        return path.join(env.ROOT_PATH, 'users/resources/mails/user-invite-user.mail.hbs');
    }

    data() {
        return {
            hostFullName: this.user.fullName,
            hostEmail: this.user.email,
            fullName: `${this.invitedUser.firstName} ${this.invitedUser.lastName}`,
            productName: this.productName,
            signUpLink: this.signUpLink
        };
    }

    get to(): string {
        return this.invitedUser.email;
    }
}
