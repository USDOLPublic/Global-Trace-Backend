import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { INestApplication, Type } from '@nestjs/common';
import request, { CallbackHandler } from 'supertest';
import './suppertest.helper';
import { BaseEntity } from 'typeorm';
import { AppModule } from '~app.module';
import { databaseConfig } from '~config/database.config';
import { validateConfig } from '~config/validate.config';
import { DatabaseHelper } from '~core/tests/database.helper';
import { GrievanceReportRepository } from '~grievance-report/repositories/grievance-report.repository';
import faker from 'faker';
import { DynamicLinkService } from '~dynamic-link/services/dynamic-link.service';
import { MockDynamicLinkService } from '~dynamic-link/tests/mocks/dynamic-link-service.mock';

export class TestHelper {
    public app: INestApplication;
    public httpService: any;
    public moduleFixture: TestingModule;
    public wrongUUID = '00000000-0000-0000-0000-000000000000';
    private testHelperModules: { [_: string]: any } = {};
    private databaseHelper = new DatabaseHelper();

    async initialize(overrideBuilder?: (builder: TestingModuleBuilder) => TestingModuleBuilder) {
        await this.databaseHelper.createDatabase();
        let moduleBuilder = Test.createTestingModule({
            imports: [AppModule, databaseConfig]
        })
            .overrideProvider(DynamicLinkService)
            .useClass(MockDynamicLinkService);

        if (overrideBuilder) {
            moduleBuilder = overrideBuilder(moduleBuilder);
        }
        this.moduleFixture = await moduleBuilder.compile();

        this.app = this.moduleFixture.createNestApplication();

        this.app.useGlobalPipes(validateConfig);

        await this.app.init();
        this.httpService = this.app.getHttpServer();
    }

    getTestHelperModule<T>(testHelperModule: new (t: TestHelper) => T): T {
        if (!this.testHelperModules[testHelperModule.name]) {
            this.testHelperModules[testHelperModule.name] = new testHelperModule(this);
        }
        return this.testHelperModules[testHelperModule.name];
    }

    async close() {
        await this.app.close();
        await this.databaseHelper.removeAndClose();
    }

    getService<T>(service: Type<T>): Promise<T> {
        return this.moduleFixture.resolve(service);
    }

    get(url: string, callback?: CallbackHandler) {
        return request(this.httpService).get(url, callback);
    }

    post(url: string, callback?: CallbackHandler) {
        return request(this.httpService).post(url, callback);
    }

    put(url: string, callback?: CallbackHandler) {
        return request(this.httpService).put(url, callback);
    }

    patch(url: string, callback?: CallbackHandler) {
        return request(this.httpService).patch(url, callback);
    }

    delete(url: string, callback?: CallbackHandler) {
        return request(this.httpService).delete(url, callback);
    }

    async invisibleInDatabase(entity: typeof BaseEntity, condition) {
        if (typeof condition === 'string') {
            condition = { id: condition };
        }
        if (await entity.getRepository().findOneBy(condition)) {
            throw new Error(`${JSON.stringify(condition)}  visible in database`);
        }
    }

    async visibleInDatabase(entity: typeof BaseEntity, condition) {
        if (typeof condition === 'string') {
            condition = { id: condition };
        }
        if (!(await entity.getRepository().findOneBy(condition))) {
            throw new Error(`${JSON.stringify(condition)} invisible in database`);
        }
    }

    binaryParser(res: any, callback) {
        res.setEncoding('binary');
        res.data = '';
        res.on('data', function (chunk) {
            res.data += chunk;
        });
        res.on('end', function () {
            callback(null, Buffer.from(res.data, 'binary'));
        });
    }

    fakeUUID() {
        return '00000000-0000-0000-0000-000000000000';
    }

    fakePhoneNumber() {
        const numArr = [3, 7, 8, 9];
        const randomNum = numArr[Math.floor(Math.random() * numArr.length)];
        return faker.phone.phoneNumber(`+84${randomNum}########`);
    }

    fakeFirstName() {
        return faker.name.firstName().replace(/\W/g, '');
    }

    fakeLastName() {
        return faker.name.lastName().replace(/\W/g, '');
    }

    async clearGrievanceReports() {
        await GrievanceReportRepository.make().delete({});
    }
}
