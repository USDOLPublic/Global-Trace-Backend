import { LoggerModule } from '@diginexhk/nestjs-logger';
import { env } from './env.config';

export const loggerConfig = LoggerModule.forRoot({ enableLog: ['development', 'qa'].includes(env.APP_ENV) });
