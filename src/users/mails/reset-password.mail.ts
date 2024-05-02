import { currentLanguage, trans } from '@diginexhk/nestjs-cls-translation';
import { BaseMail } from '@diginexhk/nestjs-mailer';
import path from 'path';
import { env } from '~config/env.config';
import { URDU_LANGUAGE } from '~core/constants/default-language.constant';
import { UserEntity } from '~users/entities/user.entity';

export class ResetPasswordMail extends BaseMail {
    constructor(
        private user: UserEntity,
        private resetLink: string,
        private email: string,
        private productName: string
    ) {
        super();
    }

    get subject(): string {
        return trans('mail.reset_password_subject', { args: { productName: this.productName } });
    }

    get template(): string {
        if (currentLanguage() === URDU_LANGUAGE) {
            return path.join(env.ROOT_PATH, 'users/resources/mails/reset-password.ur.mail.hbs');
        }
        return path.join(env.ROOT_PATH, 'users/resources/mails/reset-password.mail.hbs');
    }

    data() {
        return {
            fullName: this.user.fullName,
            productName: this.productName,
            resetLink: this.resetLink
        };
    }

    get to(): string {
        return this.email;
    }
}
