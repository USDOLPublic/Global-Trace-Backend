import { BadRequestException, HttpStatus } from '@nestjs/common';
import assert from 'assert';
import faker from 'faker';
import _, { toLower } from 'lodash';
import moment from 'moment';
import { IsNull, Not } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { generalStringCode } from '~core/helpers/string.helper';
import { TestHelper } from '~core/tests/test.helper';
import { DynamicLinkService } from '~dynamic-link/services/dynamic-link.service';
import { MockDynamicLinkService } from '~dynamic-link/tests/mocks/dynamic-link-service.mock';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { DEFAULT_PASSWORD } from '~users/constants/default-password.constant';
import { OtpEntity } from '~users/entities/otp.entity';
import { UserEntity } from '~users/entities/user.entity';
import { UserStatusEnum } from '~users/enums/user-status.enum';
import { UserRepository } from '~users/repositories/user.repository';
import { AdminService } from '~users/services/admin.service';
import { UserService } from '~users/services/user.service';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('UserController (e2e)', () => {
    let testHelper = new TestHelper();
    let adminService: AdminService;
    let userService: UserService;
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    let adminUser: UserEntity;
    let superAdmin: UserEntity;

    beforeAll(async () => {
        await testHelper.initialize((builder) =>
            builder.overrideProvider(DynamicLinkService).useClass(MockDynamicLinkService)
        );
        userService = testHelper.moduleFixture.get<UserService>(UserService);
        adminService = testHelper.moduleFixture.get<AdminService>(AdminService);
        adminUser = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        superAdmin = await userTestHelper.createUser({}, UserRoleEnum.SUPER_ADMIN);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Admin resend invitation', () => {
        it('Admin resend invitation to brand successfully', async () => {
            const roleBrand = await RoleRepository.make().findByName(UserRoleEnum.BRAND);
            const brandData = {
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                roleId: roleBrand.id,
                roleType: roleBrand.type,
                brandInformation: {
                    name: faker.company.companyName()
                }
            };

            await testHelper
                .post('/users/invite')
                .send(brandData)
                .authenticate(await userTestHelper.getToken(adminUser))
                .isCreated();

            const brand = await UserRepository.make().findOneBy({ email: brandData.email });
            const oldToken = await userTestHelper.getOtp(brand.id);

            await testHelper
                .post(`/users/${brand.id}/resend-invitation`)
                .authenticate(await userTestHelper.getToken(adminUser))
                .isNoContent();

            await testHelper.invisibleInDatabase(OtpEntity, {
                token: oldToken.token,
                isValid: true
            });

            const otp = await userTestHelper.getOtp(brand.id);
            testHelper.post('/auth/signup').send({ token: otp.token, password: DEFAULT_PASSWORD }).isCreated();
        });

        it('Admin resend invitation to supplier successfully', async () => {
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
                .authenticate(await userTestHelper.getToken(adminUser))
                .isCreated();

            const supplier = await UserRepository.make().findOneBy({ email: supplierData.email });
            const oldToken = await userTestHelper.getOtp(supplier.id);

            await testHelper
                .post(`/users/${supplier.id}/resend-invitation`)
                .authenticate(await userTestHelper.getToken(adminUser))
                .isNoContent();

            expect(oldToken).toBeDefined();
            const otp = await userTestHelper.getOtp(supplier.id);
            testHelper.post('/auth/signup').send({ token: otp.token, password: DEFAULT_PASSWORD }).isCreated();
        });

        it('Admin resend invitation to farm monitor (Web) successfully', async () => {
            const roleFarmMonitorWeb = await RoleRepository.make().findByName(UserRoleEnum.FARM_MONITOR_WEB);
            const supplierData = {
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                roleId: roleFarmMonitorWeb.id,
                roleType: roleFarmMonitorWeb.type
            };

            await testHelper
                .post('/users/invite')
                .send(supplierData)
                .authenticate(await userTestHelper.getToken(adminUser))
                .isCreated();

            const supplier = await UserRepository.make().findOneBy({ email: supplierData.email });
            const oldToken = await userTestHelper.getOtp(supplier.id);

            await testHelper
                .post(`/users/${supplier.id}/resend-invitation`)
                .authenticate(await userTestHelper.getToken(adminUser))
                .isNoContent();

            expect(oldToken).toBeDefined();
            const otp = await userTestHelper.getOtp(supplier.id);
            testHelper.post('/auth/signup').send({ token: otp.token, password: DEFAULT_PASSWORD }).isCreated();
        });

        it('Admin can not resend invitation to ginner', async () => {
            const user = await userTestHelper.createUser({ status: UserStatusEnum.INVITED }, UserRoleEnum.GINNER);
            return testHelper
                .post(`/users/${user.id}/resend-invitation`)
                .authenticate(await userTestHelper.getToken(adminUser))
                .isNoContent();
        });

        it('Admin can not resend invitation to user who is already signed up', async () => {
            const user = await userTestHelper.createUser({ status: UserStatusEnum.ACTIVE }, UserRoleEnum.BRAND);
            jest.spyOn(adminService, 'resendInvitation').mockImplementation(async () => {
                const invitedUser = await userService.findUserById(user.id);

                if (invitedUser.status !== UserStatusEnum.INVITED) {
                    throw new BadRequestException({ translate: 'error.user_signed_up' });
                }
            });
            return testHelper
                .post(`/users/${user.id}/resend-invitation`)
                .authenticate(await userTestHelper.getToken(adminUser))
                .isBadRequestError();
        });
    });

    it('Get current user', async () => {
        let currentUser = await userTestHelper.getUser();
        return testHelper
            .get('/users/me')
            .authenticate(await userTestHelper.getToken(currentUser))
            .isOk()
            .has('email')
            .notHas('password');
    });

    it('Supplier get current user successfully', async () => {
        let currentUser = await userTestHelper.createUser({});
        return testHelper
            .get('/users/me')
            .authenticate(await userTestHelper.getToken(currentUser))
            .isOk()
            .has('email')
            .notHas('password');
    });

    it('Get current user without token', async () => {
        return testHelper.get('/users/me').isAuthError();
    });

    it('User finishes guidance', async () => {
        let currentUser = await userTestHelper.getUser();
        return testHelper
            .put('/users/finish-guidance')
            .authenticate(await userTestHelper.getToken(currentUser))
            .isNoContent()
            .then(async () => {
                await testHelper.visibleInDatabase(UserEntity, {
                    id: currentUser.id,
                    finishedGuidanceAt: Not(IsNull())
                });
            });
    });

    it('Supplier change password successfully', async () => {
        const newPassword = '@Secret5bvs';
        const newUser = await userTestHelper.createUser({ password: DEFAULT_PASSWORD });
        await testHelper
            .put('/users/change-password')
            .send({ oldPassword: DEFAULT_PASSWORD, newPassword })
            .authenticate(await userTestHelper.getToken(newUser))
            .isNoContent();

        return testHelper
            .post('/auth/login')
            .send({ email: newUser.email, password: newPassword })
            .isOk()
            .has(['token', 'refreshToken', 'user', 'expireAt'])
            .notHas('user.password');
    });

    it('change password failed duplicates old password', async () => {
        const newPassword = DEFAULT_PASSWORD;
        const newUser = await userTestHelper.createUser({ password: DEFAULT_PASSWORD });
        await testHelper
            .put('/users/change-password')
            .send({ oldPassword: DEFAULT_PASSWORD, newPassword: newPassword })
            .authenticate(await userTestHelper.getToken(newUser))
            .isValidateError()
            .then(({ body }) => {
                assert.strictEqual(body.message, 'Validate Field Exception');
            });
    });

    it('Change password successfully', async () => {
        const newPassword = 'ognZ2Sgs5hHo@';
        const newUser = await userTestHelper.createUser({ password: DEFAULT_PASSWORD }, UserRoleEnum.AUDITOR);
        await testHelper
            .put('/users/change-password')
            .send({ oldPassword: DEFAULT_PASSWORD, newPassword: newPassword })
            .authenticate(await userTestHelper.getToken(newUser))
            .isNoContent();

        return testHelper
            .post('/auth/login')
            .send({ email: newUser.email, password: newPassword })
            .isOk()
            .has(['token', 'refreshToken', 'user', 'expireAt'])
            .notHas('user.password');
    });

    it('Change password failed with an incorrect password', async () => {
        const password = 'ognZ2Sgs5hHo@';
        const newUser = await userTestHelper.createUser({ password });
        return testHelper
            .put('/users/change-password')
            .send({ oldPassword: 'Ky616F8dAH3X@', newPassword: DEFAULT_PASSWORD })
            .authenticate(await userTestHelper.getToken(newUser, password))
            .isValidateError();
    });

    it('Ginner update profile successfully', async () => {
        const ginnerUser = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        await facilityTestHelper.create(ginnerUser, UserRoleEnum.GINNER);
        const data = {
            user: {
                firstName: testHelper.fakeFirstName(),
                phoneNumber: await userTestHelper.randomPhoneNumber()
            },
            facility: {
                chainOfCustody: ChainOfCustodyEnum.PRODUCT_SEGREGATION,
                traderName: testHelper.fakeFirstName()
            }
        };
        await testHelper
            .put('/users')
            .send(data)
            .authenticate(await userTestHelper.getToken(ginnerUser))
            .isNoContent();

        const user = await UserRepository.make().findById(ginnerUser.id);
        assert.strictEqual(user.firstName, data.user.firstName);
        assert.strictEqual(user.phoneNumber, data.user.phoneNumber);
    });

    it('Auditor update profile successfully', async () => {
        const ginnerUser = await userTestHelper.createUser({}, UserRoleEnum.AUDITOR);
        await facilityTestHelper.create(ginnerUser, UserRoleEnum.AUDITOR);
        const data = {
            user: {
                firstName: testHelper.fakeFirstName(),
                phoneNumber: await userTestHelper.randomPhoneNumber()
            },
            facility: {
                chainOfCustody: ChainOfCustodyEnum.PRODUCT_SEGREGATION
            }
        };
        await testHelper
            .put('/users')
            .send(data)
            .authenticate(await userTestHelper.getToken(ginnerUser))
            .isNoContent();

        const user = await UserRepository.make().findById(ginnerUser.id);
        assert.strictEqual(user.firstName, data.user.firstName);
        assert.strictEqual(user.phoneNumber, data.user.phoneNumber);

        const facility = await FacilityRepository.make().findFacilityOfUser(ginnerUser.id);
        assert.strictEqual(facility.chainOfCustody, data.facility.chainOfCustody);
    });

    it('Update profile reconciliationDuration failed', async () => {
        const farmUser = await userTestHelper.createUser({}, UserRoleEnum.FARM);
        await facilityTestHelper.create(farmUser, UserRoleEnum.FARM);

        testHelper
            .put('/users')
            .send({
                user: {},
                facility: {
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    traderName: testHelper.fakeFirstName(),
                    reconciliationDuration: '1 month',
                    reconciliationStartAt: moment().unix()
                }
            })
            .authenticate(await userTestHelper.getToken(farmUser))
            .isNoContent();

        const facility = await FacilityRepository.make().findFacilityOfUser(farmUser.id);
        assert.strictEqual(facility.reconciliationDuration, null);
        assert.strictEqual(facility.reconciliationStartAt, null);
    });

    it('Update facility trader name successfully', async () => {
        const farmMonitorUser = await userTestHelper.createUser(
            { firstName: 'Test update profile role FARM_MONITOR' },
            UserRoleEnum.FARM_MONITOR
        );
        await facilityTestHelper.create(farmMonitorUser, UserRoleEnum.FARM_MONITOR, {
            traderName: testHelper.fakeFirstName()
        });

        await testHelper
            .put('/users')
            .send({
                user: {},
                facility: {
                    chainOfCustody: ChainOfCustodyEnum.PRODUCT_SEGREGATION,
                    traderName: 'TRADER_NAME_UPDATE',
                    reconciliationDuration: '1 month',
                    businessRegisterNumber: faker.random.words(3),
                    reconciliationStartAt: moment().unix()
                }
            })
            .authenticate(await userTestHelper.getToken(farmMonitorUser))
            .isNoContent();

        const user = await UserRepository.make().findById(farmMonitorUser.id);
        assert.strictEqual(user.firstName, 'Test update profile role FARM_MONITOR');

        const facility = await FacilityRepository.make().findFacilityOfUser(farmMonitorUser.id);
        assert.strictEqual(facility.traderName, 'TRADER_NAME_UPDATE');
    });

    it('Admin gets list users successfully', async () => {
        return testHelper
            .get('/users')
            .authenticate(await userTestHelper.getToken(adminUser))
            .isOk()
            .isPagination();
    });

    it('Super admin gets list users successfully', async () => {
        return testHelper
            .get('/users')
            .authenticate(await userTestHelper.getToken(superAdmin))
            .isOk()
            .isPagination();
    });

    it('Sort list users by name:ASC successfully', async () => {
        await userTestHelper.createUser({ firstName: 'Aaa' }, UserRoleEnum.ADMIN);
        return testHelper
            .get('/users?sortFields=name:ASC')
            .authenticate(await userTestHelper.getToken(adminUser))
            .isOk()
            .isPagination()
            .then(({ body }) => {
                assert.strictEqual(body.items[0].firstName, 'Aaa');
            });
    });

    it('Sort list users by name:DESC successfully', async () => {
        await userTestHelper.createUser({ firstName: 'zzzzz' }, UserRoleEnum.ADMIN);
        return testHelper
            .get('/users?sortFields=name:DESC')
            .authenticate(await userTestHelper.getToken(adminUser))
            .isOk()
            .isPagination()
            .then(({ body }) => {
                assert.strictEqual(body.items[0].firstName, 'zzzzz');
            });
    });

    it('Sort list users by status:DESC successfully', async () => {
        await userTestHelper.createUser({ firstName: 'UGF', status: UserStatusEnum.INVITED }, UserRoleEnum.ADMIN);
        return testHelper
            .get('/users?sortFields=status:DESC')
            .authenticate(await userTestHelper.getToken(adminUser))
            .isOk()
            .isPagination()
            .then(({ body }) => {
                assert.strictEqual(body.items[0].status, UserStatusEnum.INVITED);
            });
    });

    it('Sort list users by role and user successfully', async () => {
        await userTestHelper.createUser({ firstName: 'AA' }, UserRoleEnum.ADMIN);
        return testHelper
            .get('/users?sortFields=name:ASC')
            .authenticate(await userTestHelper.getToken(adminUser))
            .isOk()
            .isPagination()
            .then(({ body }) => {
                assert.strictEqual(body.items[0].firstName, 'AA');
            });
    });

    it('Sort list users by role:ASC successfully', async () => {
        const userFirstName2 = testHelper.fakeFirstName();
        await userTestHelper.createUser({ firstName: userFirstName2 }, UserRoleEnum.ADMIN);
        return testHelper
            .get('/users?sortFields=createdAt:DESC')
            .authenticate(await userTestHelper.getToken(adminUser))
            .isOk()
            .isPagination()
            .then(({ body }) => {
                assert.strictEqual(body.items[0].firstName, userFirstName2);
            });
    });

    it('Sort list users by createdAt:DESC successfully', async () => {
        const userFirstName3 = testHelper.fakeFirstName();
        await userTestHelper.createUser({ firstName: userFirstName3 }, UserRoleEnum.FARM_MONITOR);
        return testHelper
            .get('/users?sortFields=createdAt:DESC')
            .authenticate(await userTestHelper.getToken(adminUser))
            .isOk()
            .isPagination()
            .then(({ body }) => {
                assert.strictEqual(body.items[0].firstName, userFirstName3);
            });
    });

    it('Sort list users by name:ASC successfully', async () => {
        await userTestHelper.createUser({ firstName: 'A', lastName: 'a' }, UserRoleEnum.ADMIN);
        return testHelper
            .get('/users?sortFields=name:ASC')
            .authenticate(await userTestHelper.getToken(adminUser))
            .isOk()
            .isPagination()
            .then(({ body }) => {
                assert.strictEqual(body.items[0].firstName, 'A');
            });
    });

    it('Admin edit user status successfully', async () => {
        const brandUser = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        return testHelper
            .put(`/users/${brandUser.id}`)
            .send({ user: { status: UserStatusEnum.DEACTIVATED } })
            .authenticate(await userTestHelper.getToken(adminUser))
            .isNoContent();
    });

    it('Admin edit user status fail because editing himself', async () => {
        return testHelper
            .put(`/users/${adminUser.id}`)
            .send({ user: { status: UserStatusEnum.DEACTIVATED } })
            .authenticate(await userTestHelper.getToken(adminUser))
            .isBadRequestError();
    });

    async function inviteBrand(token: string): Promise<void> {
        const roleBrand = await RoleRepository.make().findByName(UserRoleEnum.BRAND);
        const brandData = {
            email: toLower(faker.internet.email()),
            firstName: testHelper.fakeFirstName(),
            lastName: testHelper.fakeLastName(),
            roleId: roleBrand.id,
            roleType: RoleTypeEnum.BRAND,
            brandInformation: { name: faker.company.companyName() }
        };
        await testHelper
            .post('/users/invite')
            .send(brandData)
            .authenticate(token)
            .isCreated()
            .then(async ({ body }) => {
                assert.strictEqual(body.email, toLower(brandData.email));

                const supplierFacility = await FacilityRepository.make().findOne({
                    where: {
                        name: brandData.brandInformation.name
                    },
                    relations: ['type']
                });

                assert.strictEqual(supplierFacility.name, brandData.brandInformation.name);

                const facilityOfUser = await FacilityRepository.make().findFacilityOfUser(body.id);
                assert.strictEqual(facilityOfUser.id, supplierFacility.id);
            });
    }

    async function inviteSpinner(token: string): Promise<void> {
        const roleSpinner = await RoleRepository.make().findByName(UserRoleEnum.SPINNER);
        const supplierData = {
            email: toLower(faker.internet.email()),
            firstName: testHelper.fakeFirstName(),
            lastName: testHelper.fakeLastName(),
            roleId: roleSpinner.id,
            roleType: RoleTypeEnum.PRODUCT,
            supplierInformation: {
                name: faker.company.companyName() + generalStringCode()
            }
        };

        return testHelper
            .post('/users/invite')
            .send(supplierData)
            .authenticate(await userTestHelper.getToken(superAdmin))
            .isCreated()
            .then(async ({ body }) => {
                assert(body.email, supplierData.email);

                const supplierFacility = await FacilityRepository.make().findOneBy({
                    name: supplierData.supplierInformation.name
                });
                assert.strictEqual(supplierFacility.name, supplierData.supplierInformation.name);

                const facilityOfUser = await FacilityRepository.make().findFacilityOfUser(body.id);
                assert.strictEqual(facilityOfUser.id, supplierFacility.id);
            });
    }

    describe('Super admin invites users', () => {
        beforeAll(() => {
            jest.spyOn(userService, 'sendInvitationMail').mockImplementation(async () => undefined);
        });

        it('Super admin invites a new super admin successfully', async () => {
            const roleSuperAdmin = await RoleRepository.make().findByName(UserRoleEnum.SUPER_ADMIN);
            return testHelper
                .post('/users/invite')
                .send({
                    email: faker.internet.email(),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    roleId: roleSuperAdmin.id,
                    roleType: RoleTypeEnum.ADMINISTRATOR
                })
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isCreated();
        });

        it('Super admin invites brand successfully', async () => {
            await inviteBrand(await userTestHelper.getToken(superAdmin));
        });

        it('Super admin invites brand fail because missing required field', async () => {
            const roleBrand = await RoleRepository.make().findByName(UserRoleEnum.BRAND);
            return testHelper
                .post('/users/invite')
                .send({
                    email: faker.internet.email(),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    roleId: roleBrand.id
                })
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isValidateError()
                .has(['errors.roleType']);
        });

        it('Super admin invites brand fail because missing brand information', async () => {
            const roleBrand = await RoleRepository.make().findByName(UserRoleEnum.BRAND);
            return testHelper
                .post('/users/invite')
                .send({
                    email: faker.internet.email(),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    roleId: roleBrand.id,
                    roleType: RoleTypeEnum.BRAND
                })
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isValidateError()
                .has(['errors.brandInformation']);
        });

        it('Super admin invites supplier successfully', async () => {
            await inviteSpinner(await userTestHelper.getToken(superAdmin));
        });

        it('Super admin invites supplier fail because of missing required field', async () => {
            const roleMill = await RoleRepository.make().findByName(UserRoleEnum.MILL);
            return testHelper
                .post('/users/invite')
                .send({
                    email: faker.internet.email(),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    roleId: roleMill.id,
                    supplierInformation: {
                        name: faker.company.companyName()
                    }
                })
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isValidateError();
        });

        it('Super admin invites supplier fail because of not valid role', async () => {
            return testHelper
                .post('/users/invite')
                .send({
                    email: faker.internet.email(),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    roleId: 'b39b85c5-ef80-4707-b20b-056367397822',
                    supplierInformation: {
                        name: faker.company.companyName()
                    }
                })
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isValidateError();
        });

        it('Super admin invites auditor successfully', async () => {
            await inviteAuditor(await userTestHelper.getToken(superAdmin));
        });

        it('Super admin invites farm monitor successfully', async () => {
            await inviteFarmMonitor(await userTestHelper.getToken(superAdmin));
        });
    });

    describe('Admin invites users', () => {
        beforeAll(() => {
            jest.spyOn(userService, 'sendInvitationMail').mockImplementation(async () => undefined);
        });

        it('Admin invites admin successfully', async () => {
            const roleAdmin = await RoleRepository.make().findByName(UserRoleEnum.ADMIN);
            return testHelper
                .post('/users/invite')
                .send({
                    email: faker.internet.email(),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    roleId: roleAdmin.id,
                    roleType: RoleTypeEnum.ADMINISTRATOR
                })
                .authenticate(await userTestHelper.getToken(adminUser))
                .isCreated();
        });

        it('Admin can not invite a super admin', async () => {
            const roleSuperAdmin = await RoleRepository.make().findByName(UserRoleEnum.SUPER_ADMIN);
            return testHelper
                .post('/users/invite')
                .send({
                    email: faker.internet.email(),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    roleId: roleSuperAdmin.id,
                    roleType: RoleTypeEnum.ADMINISTRATOR
                })
                .authenticate(await userTestHelper.getToken(adminUser))
                .isValidateError();
        });

        it('Admin invites brand successfully', async () => {
            await inviteBrand(await userTestHelper.getToken(adminUser));
        });

        it('Admin invites brand fail because missing required field', async () => {
            const roleBrand = await RoleRepository.make().findByName(UserRoleEnum.BRAND);
            return testHelper
                .post('/users/invite')
                .send({
                    email: faker.internet.email(),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    roleId: roleBrand.id
                })
                .authenticate(await userTestHelper.getToken(adminUser))
                .isValidateError()
                .has(['errors.roleType']);
        });

        it('Admin invites brand fail because missing brand information', async () => {
            const roleBrand = await RoleRepository.make().findByName(UserRoleEnum.BRAND);
            return testHelper
                .post('/users/invite')
                .send({
                    email: faker.internet.email(),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    roleId: roleBrand.id,
                    roleType: RoleTypeEnum.BRAND
                })
                .authenticate(await userTestHelper.getToken(adminUser))
                .isValidateError()
                .has(['errors.brandInformation']);
        });

        it('Admin invites supplier successfully', async () => {
            await inviteSpinner(await userTestHelper.getToken(adminUser));
        });

        it('Admin invites supplier fail because of missing required field', async () => {
            const roleMill = await RoleRepository.make().findByName(UserRoleEnum.MILL);
            return testHelper
                .post('/users/invite')
                .send({
                    email: faker.internet.email(),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    roleId: roleMill.id,
                    supplierInformation: {
                        name: faker.company.companyName()
                    }
                })
                .authenticate(await userTestHelper.getToken(adminUser))
                .isValidateError();
        });

        it('Admin invites supplier fail because of not valid role', async () => {
            return testHelper
                .post('/users/invite')
                .send({
                    email: faker.internet.email(),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    roleId: 'b39b85c5-ef80-4707-b20b-056367397822',
                    supplierInformation: {
                        name: faker.company.companyName()
                    }
                })
                .authenticate(await userTestHelper.getToken(adminUser))
                .isValidateError();
        });

        it('Admin invites auditor successfully', async () => {
            await inviteAuditor(await userTestHelper.getToken(adminUser));
        });

        it('Admin invites farm monitor successfully', async () => {
            await inviteFarmMonitor(await userTestHelper.getToken(adminUser));
        });

        it('Admin invites web-based farm monitor successfully', async () => {
            const roleFarmMonitorWeb = await RoleRepository.make().findByName(UserRoleEnum.FARM_MONITOR_WEB);
            const farmMonitorData = {
                email: toLower(faker.internet.email()),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                roleId: roleFarmMonitorWeb.id,
                roleType: roleFarmMonitorWeb.type
            };

            return testHelper
                .post('/users/invite')
                .send(farmMonitorData)
                .authenticate(await userTestHelper.getToken(adminUser))
                .isCreated()
                .then(async ({ body }) => {
                    assert(body.email, farmMonitorData.email);

                    const facilityOfUser = await FacilityRepository.make().findFacilityOfUser(body.id);
                    assert.strictEqual(facilityOfUser.typeName, UserRoleEnum.FARM_MONITOR_WEB);
                });
        });

        it('Admin get user list include supplier ginner and does not include ginner  successfully', async () => {
            const admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
            const ginner = await userTestHelper.createUser({ status: UserStatusEnum.ACTIVE }, UserRoleEnum.GINNER);
            return testHelper
                .get('/users?createdAt:DESC')
                .authenticate(await userTestHelper.getToken(admin))
                .isOk()
                .isPagination()
                .then(({ body: { items } }) => assert.strictEqual(items[0].id, ginner.id));
        });

        it('Admin invites user failed: User role does not has permission COMPLETE_OWN_PROFILe', async () => {
            const role = await RoleRepository.make().createOne({ name: faker.random.word() });
            const data = {
                email: toLower(faker.internet.email()),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                roleId: role.id,
                roleType: RoleTypeEnum.BRAND,
                brandInformation: { name: faker.company.companyName() }
            };
            return testHelper
                .post('/users/invite')
                .send(data)
                .authenticate(await userTestHelper.getToken(adminUser))
                .isValidateError()
                .has(['errors.roleId'])
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'Validate Field Exception');

                    const message = _.get(body, 'errors.roleId.messages[0]');

                    assert.strictEqual(
                        message,
                        'You can not invite this role. The role is not allowed to log in to the system.'
                    );
                });
        });
    });

    async function inviteFarmMonitor(token: string): Promise<void> {
        const roleFarmMonitor = await RoleRepository.make().findByName(UserRoleEnum.FARM_MONITOR);
        const farmMonitorData = {
            email: toLower(faker.internet.email()),
            firstName: testHelper.fakeFirstName(),
            lastName: testHelper.fakeLastName(),
            roleId: roleFarmMonitor.id,
            roleType: roleFarmMonitor.type
        };

        return testHelper
            .post('/users/invite')
            .send(farmMonitorData)
            .authenticate(token)
            .isCreated()
            .then(async ({ body }) => {
                assert(body.email, farmMonitorData.email);

                const facilityOfUser = await FacilityRepository.make().findFacilityOfUser(body.id);
                assert.strictEqual(facilityOfUser.typeName, UserRoleEnum.FARM_MONITOR);
            });
    }

    async function inviteAuditor(token: string): Promise<void> {
        const roleAuditor = await RoleRepository.make().findByName(UserRoleEnum.AUDITOR);
        const auditorData = {
            email: toLower(faker.internet.email()),
            firstName: testHelper.fakeFirstName(),
            lastName: testHelper.fakeLastName(),
            roleId: roleAuditor.id,
            roleType: roleAuditor.type
        };

        return testHelper
            .post('/users/invite')
            .send(auditorData)
            .authenticate(token)
            .isCreated()
            .then(async ({ body }) => {
                assert(body.email, auditorData.email);

                const facilityOfUser = await FacilityRepository.make().findFacilityOfUser(body.id);
                assert.strictEqual(facilityOfUser.typeName, UserRoleEnum.AUDITOR);
            });
    }

    describe('Admin delete users', () => {
        it('Super admin deletes super admin successfully', () => {
            return deleteUserSuccessBySuperAdmin(UserRoleEnum.SUPER_ADMIN);
        });

        it('Super admin deletes another admin successfully', () => {
            return deleteUserSuccessBySuperAdmin(UserRoleEnum.ADMIN);
        });

        it('Super admin deletes brand successfully', () => {
            return deleteUserSuccessBySuperAdmin(UserRoleEnum.BRAND, UserRoleEnum.BRAND);
        });

        it('Super admin deletes auditor successfully', () => {
            return deleteUserSuccessBySuperAdmin(UserRoleEnum.AUDITOR, UserRoleEnum.AUDITOR);
        });

        it('Super admin deletes supplier successfully', () => {
            return deleteUserSuccessBySuperAdmin(UserRoleEnum.GINNER, UserRoleEnum.GINNER);
        });

        it('Super admin deletes monitor successfully', () => {
            return deleteUserSuccessBySuperAdmin(UserRoleEnum.FARM_MONITOR, UserRoleEnum.FARM_MONITOR);
        });

        it('Super admin deletes web-based farm monitor successfully', () => {
            return deleteUserSuccessBySuperAdmin(UserRoleEnum.FARM_MONITOR_WEB, UserRoleEnum.FARM_MONITOR_WEB);
        });

        it('Super admin delete ginner successfully', () => {
            return deleteUserSuccessBySuperAdmin(UserRoleEnum.GINNER, UserRoleEnum.GINNER);
        });

        it('Super admin delete spinner successfully', () => {
            return deleteUserSuccessBySuperAdmin(UserRoleEnum.SPINNER, UserRoleEnum.SPINNER);
        });

        it('Admin can not delete super admin', () => {
            return deleteUserFailByAdmin(UserRoleEnum.SUPER_ADMIN);
        });

        it('Admin deletes another admin successfully', () => {
            return deleteUserSuccessByAdmin(UserRoleEnum.ADMIN);
        });

        it('Admin deletes brand successfully', () => {
            return deleteUserSuccessByAdmin(UserRoleEnum.BRAND, UserRoleEnum.BRAND);
        });

        it('Admin deletes auditor successfully', () => {
            return deleteUserSuccessByAdmin(UserRoleEnum.AUDITOR, UserRoleEnum.AUDITOR);
        });

        it('Admin deletes supplier successfully', () => {
            return deleteUserSuccessByAdmin(UserRoleEnum.GINNER, UserRoleEnum.GINNER);
        });

        it('Admin deletes monitor successfully', () => {
            return deleteUserSuccessByAdmin(UserRoleEnum.FARM_MONITOR, UserRoleEnum.FARM_MONITOR);
        });

        it('Admin deletes web-based farm monitor successfully', () => {
            return deleteUserSuccessByAdmin(UserRoleEnum.FARM_MONITOR_WEB, UserRoleEnum.FARM_MONITOR_WEB);
        });

        it('Admin delete ginner successfully', () => {
            return deleteUserSuccessByAdmin(UserRoleEnum.GINNER, UserRoleEnum.GINNER);
        });

        it('Admin delete spinner successfully', () => {
            return deleteUserSuccessByAdmin(UserRoleEnum.SPINNER, UserRoleEnum.SPINNER);
        });

        it('Branch can not call API delete user', async () => {
            const brand = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
            const auditor = await userTestHelper.createUser({}, UserRoleEnum.AUDITOR);
            return testHelper
                .delete(`/users/${auditor.id}`)
                .authenticate(await userTestHelper.getToken(brand))
                .isForbiddenError();
        });

        it('Ginner can not call API delete Spinner', async () => {
            const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
            const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
            return testHelper
                .delete(`/users/${spinner.id}`)
                .authenticate(await userTestHelper.getToken(ginner))
                .isForbiddenError();
        });

        const deleteUserSuccessByAdmin = (
            role: UserRoleEnum,
            facility: UserRoleEnum = null,
            options: QueryDeepPartialEntity<UserEntity> = {}
        ) => {
            return deleteUser(adminUser, role, HttpStatus.NO_CONTENT, facility, options);
        };

        const deleteUserFailByAdmin = (
            role: UserRoleEnum,
            facility: UserRoleEnum = null,
            options: QueryDeepPartialEntity<UserEntity> = {}
        ) => {
            return deleteUser(adminUser, role, HttpStatus.BAD_REQUEST, facility, options);
        };

        const deleteUserSuccessBySuperAdmin = (
            role: UserRoleEnum,
            facility: UserRoleEnum = null,
            options: QueryDeepPartialEntity<UserEntity> = {}
        ) => {
            return deleteUser(superAdmin, role, HttpStatus.NO_CONTENT, facility, options);
        };

        const deleteUser = async (
            requester: UserEntity,
            role: UserRoleEnum,
            statusCode: HttpStatus,
            facility: UserRoleEnum = null,
            options: QueryDeepPartialEntity<UserEntity> = {}
        ) => {
            const user = await userTestHelper.createUser(options, role);
            if (facility) {
                await facilityTestHelper.create(user, facility);
            }

            await testHelper
                .delete(`/users/${user.id}`)
                .authenticate(await userTestHelper.getToken(requester))
                .expect(statusCode);

            const updatedUser = await userTestHelper.getUserById(user.id);
            if (statusCode === HttpStatus.NO_CONTENT) {
                expect(updatedUser).toBeNull();
            } else {
                expect(updatedUser.deletedAt).toBeNull();
            }
        };
    });
});
