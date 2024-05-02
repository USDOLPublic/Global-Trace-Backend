import { env } from '~config/env.config';
import path from 'path';
import { HbsAdapter, MailerModule, MjmlAdapter } from '@diginexhk/nestjs-mailer';

const smtpConfig = env.MAILER_URL
    ? env.MAILER_URL
    : {
          host: env.SMTP.HOST,
          port: env.SMTP.PORT,
          auth: {
              user: env.SMTP.USERNAME,
              pass: env.SMTP.PASSWORD
          }
      };

export const mailConfig = MailerModule.forRoot({
    renders: {
        adapters: [
            new HbsAdapter({
                templateFolder: path.join(env.ROOT_PATH, 'mails/templates'),
                defaultVariable: {
                    webUrl: env.WEB_URL,
                    backendUrl: env.BACKEND_URL
                }
            }),
            new MjmlAdapter()
        ]
    },
    transport: smtpConfig,
    defaultFrom: env.SMTP.FROM
});
