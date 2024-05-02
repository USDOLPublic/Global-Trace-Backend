import faker from 'faker';
import { toLower } from 'lodash';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { LocationTestHelper } from '~locations/tests/location-test.helper';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('TransporterController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    let adminUser;
    let adminToken;

    beforeAll(async () => {
        await testHelper.initialize();
        adminUser = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        await userTestHelper.assignPermission(adminUser.id, PermissionEnum.INVITE_PARTNERS);
        adminToken = await userTestHelper.getToken(adminUser);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Test cases for invite TRANSPORTER business partner', () => {
        it('Invite transporter by fill info from scratch fail because not exists facility', async () => {
            return testHelper
                .post('/partners/invite/transporters')
                .authenticate(adminToken)
                .send({
                    facilityId: faker.datatype.uuid()
                })
                .isValidateError();
        });

        it('Invite transporter by fill info from scratch fail because email has already been taken', async () => {
            const transporterUser = await userTestHelper.createUser({}, UserRoleEnum.TRANSPORTER);

            return testHelper
                .post('/partners/invite/transporters')
                .authenticate(adminToken)
                .send({
                    userInformation: {
                        email: transporterUser.email,
                        firstName: testHelper.fakeFirstName(),
                        lastName: testHelper.fakeLastName(),
                        phoneNumber: testHelper.fakePhoneNumber()
                    },
                    transporterInformation: {
                        name: faker.internet.userName(),
                        countryId: LocationTestHelper.countryId,
                        districtId: LocationTestHelper.districtId,
                        address: faker.address.streetAddress(),
                        businessRegisterNumber: faker.random.words(3)
                    }
                })
                .isValidateError();
        });

        it('Invite transporter by fill info from scratch fail because not input district field', async () => {
            return testHelper
                .post('/partners/invite/transporters')
                .authenticate(adminToken)
                .send({
                    userInformation: {
                        email: toLower(faker.internet.email()),
                        firstName: testHelper.fakeFirstName(),
                        lastName: testHelper.fakeLastName(),
                        phoneNumber: testHelper.fakePhoneNumber()
                    },
                    transporterInformation: {
                        name: faker.internet.userName(),
                        countryId: LocationTestHelper.countryId,
                        address: faker.address.streetAddress(),
                        businessRegisterNumber: faker.random.words(3)
                    }
                })
                .isValidateError();
        });

        it('Invite transporter successfully when not input facility', async () => {
            return testHelper
                .post('/partners/invite/transporters')
                .authenticate(adminToken)
                .send({
                    userInformation: {
                        email: toLower(faker.internet.email()),
                        firstName: testHelper.fakeFirstName(),
                        lastName: testHelper.fakeLastName(),
                        phoneNumber: testHelper.fakePhoneNumber()
                    },
                    transporterInformation: {
                        name: faker.internet.userName(),
                        countryId: LocationTestHelper.countryId,
                        provinceId: LocationTestHelper.provinceId,
                        districtId: LocationTestHelper.districtId,
                        address: faker.address.streetAddress(),
                        businessRegisterNumber: faker.random.words(3)
                    }
                })
                .isCreated();
        });

        it('Invite transporter by add existed TRANSPORTER facility successfully', async () => {
            const transporterUser = await userTestHelper.createUser({}, UserRoleEnum.TRANSPORTER);
            const transporterFacility = await facilityTestHelper.create(transporterUser, UserRoleEnum.TRANSPORTER);

            return testHelper
                .post('/partners/invite/transporters')
                .authenticate(adminToken)
                .send({
                    facilityId: transporterFacility.id
                })
                .isCreated();
        });
    });
});
