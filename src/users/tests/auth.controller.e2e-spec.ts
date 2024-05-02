import bcrypt from 'bcrypt';
import faker from 'faker';
import { env } from '~config/env.config';
import { TestHelper } from '~core/tests/test.helper';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { DEFAULT_PASSWORD } from '~users/constants/default-password.constant';
import { UserStatusEnum } from '~users/enums/user-status.enum';
import { UserRepository } from '~users/repositories/user.repository';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('AuthController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let adminUser;

    beforeAll(async () => {
        await testHelper.initialize();
        adminUser = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Login success', async () => {
        let user = await userTestHelper.getUser();
        return testHelper
            .post('/auth/login')
            .send({ email: user.email, password: DEFAULT_PASSWORD })
            .isOk()
            .has(['token', 'refreshToken', 'user', 'expireAt'])
            .notHas(['user.password']);
    });

    it('Login success', async () => {
        let superAdminUser = await userTestHelper.createUser({}, UserRoleEnum.SUPER_ADMIN);

        await testHelper
            .post('/business-details/configuration-systems')
            .authenticate(await userTestHelper.getToken(superAdminUser))
            .isNoContent();

        return testHelper
            .post('/auth/login')
            .send({ email: superAdminUser.email, password: DEFAULT_PASSWORD })
            .isOk()
            .has(['token', 'refreshToken', 'user', 'user.completedConfiguringSystemAt', 'expireAt'])
            .notHas('user.password');
    });

    it('Wrong password', async () => {
        let user = await userTestHelper.getUser();
        return testHelper.post('/auth/login').send({ email: user.email, password: 'Secret@456' }).isAuthError();
    });

    it('Test validator email login', async () => {
        return testHelper.post('/auth/login').send({ email: 'wrong-email', password: 'Secret@456' }).isValidateError();
    });

    it('Test validator password login', async () => {
        let user = await userTestHelper.getUser();
        return testHelper.post('/auth/login').send({ email: user.email, password: 'wrong password' }).isAuthError();
    });

    it('Test validator email + password login', async () => {
        return testHelper
            .post('/auth/login')
            .send({ email: 'wrong-email', password: 'wrong password' })
            .isValidateError();
    });

    it('Get token with refresh token success', async () => {
        const email = faker.internet.email();
        const user = await userTestHelper.createUser({ email });
        let refreshToken = null;

        await testHelper
            .post('/auth/login')
            .send({ email: user.email, password: DEFAULT_PASSWORD })
            .isOk()
            .has(['token', 'refreshToken', 'user', 'expireAt'])
            .notHas('user.password')
            .then(async (response) => {
                refreshToken = response.body.refreshToken;
            });

        return testHelper
            .post('/auth/refresh-token')
            .send({ refreshToken })
            .isOk()
            .has(['user', 'token', 'refreshToken', 'user', 'expireAt']);
    });

    it('Login fail with the used refresh token', async () => {
        const user = await userTestHelper.getUser();
        let refreshToken = null;

        await Promise.all([
            await testHelper
                .post('/auth/login')
                .send({ email: user.email, password: DEFAULT_PASSWORD })
                .isOk()
                .has(['token', 'refreshToken', 'user', 'expireAt'])
                .notHas('user.password')
                .then(async (response) => {
                    refreshToken = response.body.refreshToken;
                }),
            await testHelper
                .post('/auth/refresh-token')
                .send({ refreshToken })
                .isOk()
                .has(['user', 'token', 'refreshToken', 'user', 'expireAt'])
        ]);

        return testHelper
            .put('/users/change-password')
            .send({ oldPassword: 'password', newPassword: DEFAULT_PASSWORD })
            .authenticate(refreshToken)
            .isAuthError();
    });

    it('Test refresh token failed without refresh token', async () => {
        return testHelper.post('/auth/refresh-token').isValidateError();
    });

    it('Test logout success', async () => {
        const user = await userTestHelper.createUser();
        const accessToken = await userTestHelper.getToken(user);
        return testHelper.delete('/auth/logout').authenticate(accessToken).isNoContent();
    });

    it('Test logout without token', () => {
        return testHelper.delete('/auth/logout').isAuthError();
    });

    it('Login fail because of deactivated account', async () => {
        const user = await userTestHelper.createUser({ status: UserStatusEnum.DEACTIVATED });

        return testHelper
            .post('/auth/login')
            .send({ email: user.email, password: DEFAULT_PASSWORD })
            .isBadRequestError();
    });

    it('Login fail because of wrong email', async () => {
        await userTestHelper.createUser({ status: UserStatusEnum.DEACTIVATED });

        return testHelper
            .post('/auth/login')
            .send({ email: 'wrongEmail@gmail.com', password: DEFAULT_PASSWORD })
            .isAuthError();
    });

    it('Supplier login successfully', async () => {
        const roleMill = await RoleRepository.make().findByName(UserRoleEnum.MILL);
        const supplierData = {
            email: faker.internet.email(),
            firstName: testHelper.fakeFirstName(),
            lastName: testHelper.fakeLastName(),
            roleId: roleMill.id,
            roleType: roleMill.type,
            supplierInformation: {
                name: faker.company.companyName()
            }
        };

        await testHelper
            .post('/users/invite')
            .send(supplierData)
            .authenticate(await userTestHelper.getToken(adminUser));

        const supplier = await UserRepository.make().findOneBy({ email: supplierData.email });
        supplier.password = bcrypt.hashSync(DEFAULT_PASSWORD, env.SALT_ROUND);
        await supplier.save();

        return testHelper
            .post('/auth/login')
            .send({ email: supplierData.email, password: DEFAULT_PASSWORD })
            .isOk()
            .has(['user', 'token', 'refreshToken', 'expireAt']);
    });

    it('Brand login successfully', async () => {
        const roleBrand = await RoleRepository.make().findByName(UserRoleEnum.BRAND);
        const brandData = {
            email: faker.internet.email(),
            firstName: testHelper.fakeFirstName(),
            lastName: testHelper.fakeLastName(),
            roleId: roleBrand.id,
            roleType: RoleTypeEnum.BRAND,
            brandInformation: {
                name: faker.company.companyName()
            }
        };

        await testHelper
            .post('/users/invite')
            .send(brandData)
            .authenticate(await userTestHelper.getToken(adminUser));

        const brander = await UserRepository.make().findOneBy({ email: brandData.email });
        brander.password = bcrypt.hashSync(DEFAULT_PASSWORD, env.SALT_ROUND);
        await brander.save();

        return testHelper
            .post('/auth/login')
            .send({ email: brander.email, password: DEFAULT_PASSWORD })
            .isOk()
            .has(['user', 'token', 'refreshToken', 'expireAt']);
    });

    it('Auditor login successfully', async () => {
        const roleAuditor = await RoleRepository.make().findByName(UserRoleEnum.AUDITOR);
        const auditorData = {
            email: faker.internet.email(),
            firstName: testHelper.fakeFirstName(),
            lastName: testHelper.fakeLastName(),
            roleId: roleAuditor.id,
            roleType: roleAuditor.type
        };

        await testHelper
            .post('/users/invite')
            .send(auditorData)
            .authenticate(await userTestHelper.getToken(adminUser));

        const brander = await UserRepository.make().findOneBy({ email: auditorData.email });
        brander.password = bcrypt.hashSync(DEFAULT_PASSWORD, env.SALT_ROUND);
        await brander.save();

        return testHelper
            .post('/auth/login')
            .send({ email: brander.email, password: DEFAULT_PASSWORD })
            .isOk()
            .has(['user', 'token', 'refreshToken', 'expireAt']);
    });
});
