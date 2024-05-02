import assert from 'assert';
import { readFileSync } from 'fs';
import path from 'path';
import { env } from '~config/env.config';
import { TestHelper } from '~core/tests/test.helper';
import { LocationTestHelper } from '~locations/tests/location-test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { BusinessDetailEntity } from '~site-details/entities/business-detail.entity';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('BusinessDetailController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let superAdmin: UserEntity;
    const basePath = '/business-details';

    beforeAll(async () => {
        await testHelper.initialize();
        superAdmin = await userTestHelper.createUser({}, UserRoleEnum.SUPER_ADMIN);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Super Admin get business details', () => {
        it('Get a business details successfully', async () => {
            return testHelper
                .get(basePath)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk()
                .has(['id', 'createdAt', 'updatedAt', 'name', 'sector', 'countryIds', 'commodities']);
        });
    });

    it('Get list of goods successfully', async () => {
        return testHelper
            .get(`${basePath}/selected-commodities`)
            .authenticate(await userTestHelper.getToken(superAdmin))
            .isOk();
    });

    describe('Super Admin edit a business detail', () => {
        it('Edit a business detail successfully', async () => {
            const data = {
                name: 'Supply chain updated',
                countryIds: [LocationTestHelper.countryId],
                commodities: ['Cotton', 'Amber']
            };
            return testHelper
                .put(basePath)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .type('form')
                .field('name', data.name)
                .field('countryIds', data.countryIds)
                .field('commodities', data.commodities)
                .attach(
                    'logo',
                    readFileSync(path.join(env.ROOT_PATH, 'core/tests/assets/dev-test-image.png')),
                    'dev-test-image.png'
                )
                .isNoContent()
                .then(async () => {
                    await testHelper.visibleInDatabase(BusinessDetailEntity, {
                        name: data.name,
                        countryIds: data.countryIds,
                        commodities: data.commodities
                    });
                });
        });
    });

    it('Get commodities successfully', async () => {
        return testHelper
            .get(`${basePath}/commodities`)
            .authenticate(await userTestHelper.getToken(superAdmin))
            .isOk();
    });

    it('Complete configuring system successfully', async () => {
        return testHelper
            .post(`${basePath}/configuration-systems`)
            .authenticate(await userTestHelper.getToken(superAdmin))
            .isNoContent();
    });

    it('Complete configuring system failed: System configuration already completed.', async () => {
        return testHelper
            .post(`${basePath}/configuration-systems`)
            .authenticate(await userTestHelper.getToken(superAdmin))
            .isBadRequestError()
            .then(({ body }) => {
                assert.strictEqual(body.message, 'System configuration already completed.');
            });
    });
});
