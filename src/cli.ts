import { env } from '~config/env.config';

env.ROOT_PATH = __dirname;

import { NestFactory } from '@nestjs/core';
import { AppModule } from '~app.module';
import { CommandModule, CommandService } from '@diginexhk/nestjs-command';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const commandService: CommandService = app.select(CommandModule).get(CommandService, { strict: true });
    await commandService.exec();
    await app.close();
}

bootstrap();
