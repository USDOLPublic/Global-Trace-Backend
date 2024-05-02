import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '~app.module';
import { env } from '~config/env.config';
import { BadRequestException } from '@nestjs/common';
import path from 'path';
import { EnvironmentSwagger } from '~swaggers/environment-swagger';
import { MicroserviceOptions } from '@nestjs/microservices';
import { microserviceConfig } from '~config/microservice.config';
import { validateConfig } from '~config/validate.config';
import { trimDataConfig } from '~config/trim-data.config';

declare const module: any;

export class Bootstrap {
    private app: NestExpressApplication;

    async initApp() {
        this.app = await NestFactory.create<NestExpressApplication>(AppModule);
        if (env.APP_PREFIX) {
            this.app.setGlobalPrefix(env.APP_PREFIX);
        }
    }

    initPipes() {
        this.app.useGlobalPipes(trimDataConfig);
        this.app.useGlobalPipes(validateConfig);
    }

    initCors() {
        const regexWhiteListDomains = env.WHITELIST_DOMAINS.map((item) => {
            return new RegExp(`^${item.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
        });
        this.app.enableCors({
            origin: function (requestOrigin, callback) {
                if (!requestOrigin) {
                    return callback(null, true);
                }
                requestOrigin = requestOrigin.replace('https://', '').replace('http://', '');
                const isValidOrigin = regexWhiteListDomains.some((item) => item.test(requestOrigin));

                if (isValidOrigin) {
                    return callback(null, true);
                } else {
                    return callback(new BadRequestException(`No CORS allowed. Origin: ${requestOrigin}`), false);
                }
            }
        });
    }

    initStaticAsset() {
        this.app.useStaticAssets(path.join(env.ROOT_PATH, 'static'), {
            prefix: `/${env.APP_PREFIX}`
        });
    }

    buildSwagger() {
        new EnvironmentSwagger(this.app).buildDocuments();
    }

    initMicroservice() {
        this.app.connectMicroservice<MicroserviceOptions>(microserviceConfig);
    }

    async start() {
        this.app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
        await this.app.startAllMicroservices();
        await this.app.listen(env.APP_PORT);
    }

    async enableHotReload() {
        if (module.hot) {
            module.hot.accept();
            module.hot.dispose(() => this.app.close());
        }
    }
}
