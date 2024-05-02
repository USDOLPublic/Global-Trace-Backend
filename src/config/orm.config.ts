import { env } from './env.config';
import { randomUUID } from 'crypto';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { initLoggerDatabase } from '@diginexhk/nestjs-logger';

let isTest = process.env.NODE_ENV === 'test';
const config: TypeOrmModuleOptions = {
    type: env.DATABASE.CONNECT,
    host: env.DATABASE.HOST,
    port: env.DATABASE.PORT,
    username: env.DATABASE.USER,
    password: env.DATABASE.PASSWORD,
    database: env.DATABASE.NAME + (isTest ? `_${randomUUID()}` : ''),
    entities: [`${env.ROOT_PATH}/**/*.entity.${isTest ? 'ts' : 'js'}`],
    factories: [`${env.ROOT_PATH}/**/databases/factories/*.factory.${isTest ? 'ts' : 'js'}`],
    synchronize: false,
    migrations: [`${env.ROOT_PATH}/**/databases/migrations/*.${isTest ? 'ts' : 'js'}`],
    migrationsRun: true,
    keepConnectionAlive: true,
    autoLoadEntities: true,
    cli: {
        migrationsDir: `${env.ROOT_PATH}/**/databases/migrations/*.${isTest ? 'ts' : 'js'}`
    },
    logging: false
} as any;

initLoggerDatabase(config);

export = config;
