import dotenv from 'dotenv';

let isTest = process.env.NODE_ENV === 'test';
dotenv.config();

export const env = {
    APP_PORT: process.env.APP_PORT,
    APP_ENV: process.env.APP_ENV,
    APP_KEY: process.env.APP_KEY,
    APP_PREFIX: process.env.PREFIX || '',
    APP_NAME: 'CARLA',
    BACKEND_URL: process.env.BACKEND_URL,
    WEB_URL: process.env.WEB_URL,
    KAFKA_URL: process.env.KAFKA_URL,
    WEB_2_PDF_API_URL: process.env.WEB_2_PDF_API_URL,
    WEB_2_PDF_API_KEY: process.env.WEB_2_PDF_API_KEY,
    JWT: {
        SECRET: process.env.JWT_SECRET,
        EXPIRE: process.env.JWT_EXPIRE || '7d',
        REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d'
    },
    THROTTLE: {
        TTL: Number(process.env.THROTTLE_TTL || 60),
        LIMIT: Number(process.env.THROTTLE_LIMIT || 60)
    },
    SALT_ROUND: 10,
    ROOT_PATH: process.cwd() + (isTest ? '/src' : ''),
    DATABASE: {
        CONNECT: process.env.DATABASE_CONNECT as any,
        HOST: process.env.DATABASE_HOST,
        PORT: Number(process.env.DATABASE_PORT),
        USER: process.env.DATABASE_USER,
        PASSWORD: process.env.DATABASE_PASSWORD,
        NAME: process.env.DATABASE_NAME
    },
    REDIS: {
        HOST: process.env.REDIS_HOST,
        PORT: Number(process.env.REDIS_PORT || 6379),
        USER: process.env.REDIS_USER,
        PASS: process.env.REDIS_PASS
    },
    SMTP: {
        HOST: process.env.SMTP_HOST,
        PORT: Number(process.env.SMTP_PORT),
        USERNAME: process.env.SMTP_USER,
        PASSWORD: process.env.SMTP_PASS,
        FROM: process.env.MAIL_SEND_FROM
    },
    MAILER_URL: process.env.MAILER_URL,
    FORGOT_PASSWORD_TTL: Number(process.env.FORGOT_PASSWORD_TTL || 15),
    INVITE_USER_TTL: Number(process.env.INVITE_USER_TTL || 60 * 24 * 7),
    WHITELIST_DOMAINS: (process.env.WHITELIST_DOMAINS || 'localhost').split(','),
    CONTACT_MAIL: process.env.CONTACT_MAIL || 'support@diginex-usdol.com',
    S3: {
        ACCOUNT_NAME: process.env.S3_ACCOUNT_NAME,
        ACCOUNT_KEY: process.env.S3_ACCOUNT_KEY,
        BLOB_CONTAINER: process.env.S3_BLOB_CONTAINER || 'files',
        SAS_EXPIRED_IN: Number(process.env.S3_SAS_EXPIRED_IN) || 24 * 60 * 60
    },
    KAFKA_PREFIX: process.env.KAFKA_PREFIX,
    BRANCH_DYNAMIC_LINK: {
        API_KEY: process.env.BRANCH_DYNAMIC_LINK_API_KEY
    },
    RAPID_API: {
        API_KEY: process.env.RAPID_API_KEY,
        MAX_PAGE_LIMIT: Number(process.env.RAPID_MAX_PAGE_LIMIT) || 10,
        MAX_REQUEST_PER_SECOND: Number(process.env.RAPID_MAX_REQUEST_PER_SECOND) || 1,
        GEO_DB: {
            HOST: process.env.RAPID_API_GEODB_HOST,
            BASE_URL: process.env.RAPID_API_GEODB_BASE_URL
        }
    },
    OPEN_APPAREL_REGISTRY_API: {
        API_KEY: process.env.OPEN_APPAREL_REGISTRY_API_KEY,
        BASE_URL: process.env.OPEN_APPAREL_REGISTRY_BASE_URL
    },
    GOOGLE_MAPS: {
        API_KEY: process.env.GOOGLE_MAPS_API_KEY
    },
    GOOGLE_TRANSLATE: {
        API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY || '{}'
    }
};
