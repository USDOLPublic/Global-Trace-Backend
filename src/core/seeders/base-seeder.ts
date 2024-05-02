import { Test } from '@nestjs/testing';
import { AppModule } from '~app.module';
import { databaseConfig } from '~config/database.config';
import { BaseSeeder as AbstractSeeder } from '@diginexhk/nestjs-seeder';

export abstract class BaseSeeder extends AbstractSeeder {
    createModule() {
        return Test.createTestingModule({
            imports: [AppModule, databaseConfig]
        }).compile();
    }

    abstract run(): Promise<void>;
}
