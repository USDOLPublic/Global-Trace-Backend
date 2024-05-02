import faker from 'faker';
import { DeepPartial } from 'typeorm';
import { TestHelper } from '~core/tests/test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { OtpEntity } from '~users/entities/otp.entity';
import { OtpRepository } from '~users/repositories/otp.repository';
import { UserRepository } from '~users/repositories/user.repository';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('ResetPasswordController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let email = 'test+01@diginex.com';
    let adminUser;

    let getTokenOtp = async (userId: string, options: DeepPartial<OtpEntity>) => {
        let otp = await userTestHelper.getOrCreateOtp(userId);
        return otp.token;
    };

    let token = null;

    let updateValidToken = async (validToken) => {
        await OtpRepository.make().update({ token: validToken }, { isValid: true });
        return validToken;
    };

    beforeAll(async () => {
        await testHelper.initialize();
        adminUser = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Request change password success', async () => {
        await userTestHelper.createUser({ email });
        return testHelper.post('/reset-password').send({ email }).isNoContent();
    });

    it('Request change password success for supplier', async () => {
        const roleGinner = await RoleRepository.make().findByName(UserRoleEnum.GINNER);
        const supplierData = {
            email: faker.internet.email(),
            firstName: testHelper.fakeFirstName(),
            lastName: testHelper.fakeLastName(),
            roleId: roleGinner.id,
            roleType: roleGinner.type,
            supplierInformation: {
                name: faker.company.companyName()
            }
        };

        await testHelper
            .post('/users/invite')
            .send(supplierData)
            .authenticate(await userTestHelper.getToken(adminUser));

        const supplier = await UserRepository.make().findOneBy({ email: supplierData.email });
        return testHelper.post('/reset-password').send({ email: supplier.email }).isNoContent();
    });

    it('Request change password failed because user is not allowed to reset password', async () => {
        const transporter = await userTestHelper.createUser({}, UserRoleEnum.TRANSPORTER);
        return testHelper.post('/reset-password').send({ email: transporter.email }).isBadRequestError;
    });

    it('request update password invalid password', async () => {
        let validToken = await updateValidToken(token);
        return testHelper.put('/reset-password').send({ password: '123abc', token: validToken }).isValidateError();
    });

    it('Reset password successfully', async () => {
        const newUser = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        token = await getTokenOtp(newUser.id, { isValid: true });
        return testHelper
            .put('/reset-password')
            .send({ password: 'Testing@123', token })
            .authenticate(await userTestHelper.getToken(newUser))
            .isNoContent();
    });
});
