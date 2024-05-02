import assert from 'assert';
import faker from 'faker';
import { toLower } from 'lodash';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { LocationTestHelper } from '~locations/tests/location-test.helper';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('BrokerController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    let supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
    let productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);
    let spinner;
    let spinnerToken;
    let productDefinition;

    beforeAll(async () => {
        await testHelper.initialize();
        spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        await userTestHelper.assignPermission(spinner.id, PermissionEnum.INVITE_PARTNERS);
        await userTestHelper.assignPermission(spinner.id, PermissionEnum.ALLOW_SALE_INTERMEDIARIES);
        spinnerToken = await userTestHelper.getToken(spinner);
        productDefinition = await productTestHelper.createProductDefinition({
            name: faker.name.title()
        });
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Test cases for invite BROKER business partner', () => {
        const userInformation = {
            email: toLower(faker.internet.email()),
            firstName: testHelper.fakeFirstName(),
            lastName: testHelper.fakeLastName(),
            phoneNumber: testHelper.fakePhoneNumber()
        };

        const brokerInformation = {
            name: faker.internet.userName(),
            countryId: LocationTestHelper.countryId,
            provinceId: LocationTestHelper.provinceId,
            districtId: LocationTestHelper.districtId,
            address: faker.address.streetAddress(),
            businessRegisterNumber: faker.random.words(3)
        };

        it('Invite broker by fill info from scratch fail because not input country field', async () => {
            return testHelper
                .post('/partners/invite/brokers')
                .authenticate(spinnerToken)
                .send({
                    userInformation: userInformation,
                    brokerInformation: {
                        name: faker.internet.userName(),
                        provinceId: LocationTestHelper.provinceId,
                        districtId: LocationTestHelper.districtId,
                        address: faker.address.streetAddress(),
                        businessRegisterNumber: faker.random.words(3)
                    }
                })
                .isValidateError();
        });

        it('Invite broker by fill info from scratch fail because not input district field', async () => {
            return testHelper
                .post('/partners/invite/brokers')
                .authenticate(spinnerToken)
                .send({
                    userInformation: userInformation,
                    brokerInformation: {
                        name: faker.internet.userName(),
                        provinceId: LocationTestHelper.provinceId,
                        countryId: LocationTestHelper.countryId,
                        address: faker.address.streetAddress(),
                        businessRegisterNumber: faker.random.words(3)
                    }
                })
                .isValidateError();
        });

        it('Invite broker by fill info from scratch fail because not input province field', async () => {
            return testHelper
                .post('/partners/invite/brokers')
                .authenticate(spinnerToken)
                .send({
                    userInformation: userInformation,
                    brokerInformation: {
                        name: faker.internet.userName(),
                        countryId: LocationTestHelper.countryId,
                        districtId: LocationTestHelper.districtId,
                        address: faker.address.streetAddress(),
                        businessRegisterNumber: faker.random.words(3)
                    }
                })
                .isValidateError();
        });

        it('Invite broker and broker partner (GINNER) successfully', async () => {
            const roleGinner = await RoleRepository.make().find({ where: { name: UserRoleEnum.GINNER } });
            const roleSpinner = await RoleRepository.make().find({ where: { name: UserRoleEnum.SPINNER } });

            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleSpinner[0].id,
                fromRoleId: null,
                outputProductDefinitionId: productDefinition.id
            });

            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleGinner[0].id,
                fromRoleId: roleSpinner[0].id,
                outputProductDefinitionId: productDefinition.id
            });

            const cloneData = {
                userInformation: userInformation,
                brokerInformation: brokerInformation,
                partners: [
                    {
                        userInformation: {
                            email: toLower(faker.internet.email()),
                            firstName: testHelper.fakeFirstName(),
                            lastName: testHelper.fakeLastName(),
                            phoneNumber: testHelper.fakePhoneNumber()
                        },
                        partnerInformation: {
                            name: faker.internet.userName(),
                            districtId: LocationTestHelper.districtId,
                            provinceId: LocationTestHelper.provinceId,
                            countryId: LocationTestHelper.countryId,
                            roleId: roleGinner[0].id
                        }
                    }
                ]
            };

            return testHelper
                .post('/partners/invite/brokers')
                .authenticate(spinnerToken)
                .send(cloneData)
                .isCreated()
                .then(async ({ body }) => {
                    await handleBrokerInviteResponse(body, cloneData);
                });
        });

        it('Invite broker and existed broker partner (GINNER) successfully', async () => {
            const ginnerUser = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
            const ginnerFacility = await facilityTestHelper.create(ginnerUser, UserRoleEnum.GINNER);

            const roleGinner = await RoleRepository.make().find({ where: { name: UserRoleEnum.GINNER } });
            const roleSpinner = await RoleRepository.make().find({ where: { name: UserRoleEnum.SPINNER } });

            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleSpinner[0].id,
                fromRoleId: null,
                outputProductDefinitionId: productDefinition.id
            });

            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleGinner[0].id,
                fromRoleId: roleSpinner[0].id,
                outputProductDefinitionId: productDefinition.id
            });
            const cloneData = {
                userInformation: {
                    email: toLower(faker.internet.email()),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    phoneNumber: testHelper.fakePhoneNumber()
                },
                brokerInformation: {
                    name: faker.internet.userName(),
                    countryId: LocationTestHelper.countryId,
                    provinceId: LocationTestHelper.provinceId,
                    districtId: LocationTestHelper.districtId,
                    address: faker.address.streetAddress(),
                    businessRegisterNumber: faker.random.words(3)
                },
                partners: [{ facilityId: ginnerFacility.id }]
            };

            return testHelper
                .post('/partners/invite/brokers')
                .authenticate(spinnerToken)
                .send(cloneData)
                .isCreated()
                .then(async ({ body }) => {
                    await handleBrokerInviteResponse(body, cloneData);
                });
        });

        it('Invite broker and broker partner (MILL) successfully', async () => {
            const roleMill = await RoleRepository.make().find({ where: { name: UserRoleEnum.MILL } });
            const roleSpinner = await RoleRepository.make().find({ where: { name: UserRoleEnum.SPINNER } });

            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleSpinner[0].id,
                fromRoleId: null,
                outputProductDefinitionId: productDefinition.id
            });

            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleMill[0].id,
                fromRoleId: roleSpinner[0].id,
                outputProductDefinitionId: productDefinition.id
            });

            const cloneData = {
                userInformation: {
                    email: toLower(faker.internet.email()),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    phoneNumber: testHelper.fakePhoneNumber()
                },
                brokerInformation: {
                    name: faker.internet.userName(),
                    countryId: LocationTestHelper.countryId,
                    provinceId: LocationTestHelper.provinceId,
                    districtId: LocationTestHelper.districtId,
                    address: faker.address.streetAddress(),
                    businessRegisterNumber: faker.random.words(3)
                },
                partners: [
                    {
                        userInformation: {
                            email: toLower(faker.internet.email()),
                            firstName: testHelper.fakeFirstName(),
                            lastName: testHelper.fakeLastName(),
                            phoneNumber: testHelper.fakePhoneNumber()
                        },
                        partnerInformation: {
                            name: faker.internet.userName(),
                            districtId: LocationTestHelper.districtId,
                            provinceId: LocationTestHelper.provinceId,
                            countryId: LocationTestHelper.countryId,
                            roleId: roleMill[0].id
                        }
                    }
                ]
            };

            return testHelper
                .post('/partners/invite/brokers')
                .authenticate(spinnerToken)
                .send(cloneData)
                .isCreated()
                .then(async ({ body }) => {
                    await handleBrokerInviteResponse(body, cloneData);
                });
        });

        it('Invite broker and existed broker partner (MILL) successfully', async () => {
            const millUser = await userTestHelper.createUser({}, UserRoleEnum.MILL);
            const millFacility = await facilityTestHelper.create(millUser, UserRoleEnum.MILL);
            const roleMill = await RoleRepository.make().find({ where: { name: UserRoleEnum.MILL } });
            const roleSpinner = await RoleRepository.make().find({ where: { name: UserRoleEnum.SPINNER } });

            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleSpinner[0].id,
                fromRoleId: null,
                outputProductDefinitionId: productDefinition.id
            });

            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleMill[0].id,
                fromRoleId: roleSpinner[0].id,
                outputProductDefinitionId: productDefinition.id
            });

            const cloneData = {
                userInformation: {
                    email: toLower(faker.internet.email()),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    phoneNumber: testHelper.fakePhoneNumber()
                },
                brokerInformation: {
                    name: faker.internet.userName(),
                    countryId: LocationTestHelper.countryId,
                    provinceId: LocationTestHelper.provinceId,
                    districtId: LocationTestHelper.districtId,
                    address: faker.address.streetAddress(),
                    businessRegisterNumber: faker.random.words(3)
                },
                partners: [{ facilityId: millFacility.id }]
            };

            return testHelper
                .post('/partners/invite/brokers')
                .authenticate(spinnerToken)
                .send(cloneData)
                .isCreated()
                .then(async ({ body }) => {
                    await handleBrokerInviteResponse(body, cloneData);
                });
        });

        const handleBrokerInviteResponse = async (body: any, cloneData: any) => {
            assert.strictEqual(body.email, cloneData.userInformation.email);

            const brokerFacility = await FacilityRepository.make().findOneBy({
                name: cloneData.brokerInformation.name
            });
            assert.strictEqual(brokerFacility.name, cloneData.brokerInformation.name);

            const facilityOfUser = await FacilityRepository.make().findFacilityOfUser(body.id);
            assert.strictEqual(facilityOfUser.id, brokerFacility.id);
        };

        it('Invite broker and broker partner (BRAND) fail because not partner of broker', async () => {
            const brand = await userTestHelper.createUser({}, UserRoleEnum.BRAND);

            const cloneData = {
                userInformation: {
                    email: toLower(faker.internet.email()),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    phoneNumber: testHelper.fakePhoneNumber()
                },
                brokerInformation: {
                    name: faker.internet.userName(),
                    countryId: LocationTestHelper.countryId,
                    provinceId: LocationTestHelper.provinceId,
                    districtId: LocationTestHelper.districtId,
                    address: faker.address.streetAddress(),
                    businessRegisterNumber: faker.random.words(3)
                },
                partners: [
                    {
                        userInformation: {
                            email: toLower(faker.internet.email()),
                            firstName: testHelper.fakeFirstName(),
                            lastName: testHelper.fakeLastName(),
                            phoneNumber: testHelper.fakePhoneNumber()
                        },
                        partnerInformation: {
                            name: faker.internet.userName(),
                            districtId: LocationTestHelper.districtId,
                            provinceId: LocationTestHelper.provinceId,
                            countryId: LocationTestHelper.countryId,
                            roleId: brand.roleId
                        }
                    }
                ]
            };

            return testHelper
                .post('/partners/invite/brokers')
                .authenticate(spinnerToken)
                .send(cloneData)
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'You do not have permission to invite this role');
                });
        });

        it('Invite broker and existed broker partner (BRAND) fail because not partner of broker', async () => {
            const brand = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
            const brandFacility = await facilityTestHelper.create(brand, UserRoleEnum.BRAND);

            const cloneData = {
                userInformation: {
                    email: toLower(faker.internet.email()),
                    firstName: testHelper.fakeFirstName(),
                    lastName: testHelper.fakeLastName(),
                    phoneNumber: testHelper.fakePhoneNumber()
                },
                brokerInformation: {
                    name: faker.internet.userName(),
                    countryId: LocationTestHelper.countryId,
                    provinceId: LocationTestHelper.provinceId,
                    districtId: LocationTestHelper.districtId,
                    address: faker.address.streetAddress(),
                    businessRegisterNumber: faker.random.words(3)
                },
                partners: [{ facilityId: brandFacility.id }]
            };

            return testHelper
                .post('/partners/invite/brokers')
                .authenticate(spinnerToken)
                .send(cloneData)
                .isBadRequestError();
        });
    });
});
