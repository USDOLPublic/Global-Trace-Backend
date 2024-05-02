import faker from 'faker';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserTestHelper } from '~users/tests/user-test.helper';
import assert from 'assert';
import { RoleRepository } from '~role-permissions/repositories/role.repository';

describe('PartnerController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    let supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
    let productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);
    let adminUser;
    let ginnerUser;
    let ginnerToken;
    let adminToken;
    let ginnerFacility;
    let roleGinner;
    let roleSpinner;

    beforeAll(async () => {
        await testHelper.initialize();
        adminUser = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        adminToken = await userTestHelper.getToken(adminUser);
        ginnerUser = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerToken = await userTestHelper.getToken(ginnerUser);
        ginnerFacility = await facilityTestHelper.create(ginnerUser, UserRoleEnum.GINNER);
        roleGinner = await RoleRepository.make().find({ where: { name: UserRoleEnum.GINNER } });
        roleSpinner = await RoleRepository.make().find({ where: { name: UserRoleEnum.SPINNER } });
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Get invite roles successfully', async () => {
        return testHelper.get('/partners/roles').authenticate(ginnerToken).isOk();
    });

    it('Search exiting facilities successfully', async () => {
        const productDefinition = await productTestHelper.createProductDefinition({
            name: faker.name.title()
        });
        await supplyChainTestHelper.createSupplyChainNode({
            roleId: roleSpinner[0].id,
            fromRoleId: roleGinner[0].id,
            outputProductDefinitionId: productDefinition.id
        });
        await facilityTestHelper.create(ginnerUser, UserRoleEnum.GINNER);
        return testHelper.get('/partners/search/facilities').authenticate(ginnerToken).isOk();
    });

    it('Search exiting facilities with invalid role', async () => {
        return testHelper.get('/partners/search/facilities').authenticate(adminToken).isForbiddenError();
    });

    it('Search exiting facilities with key successfully', async () => {
        const spinnerUser = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        const productDefinition = await productTestHelper.createProductDefinition({
            name: faker.name.title()
        });
        await supplyChainTestHelper.createSupplyChainNode({
            roleId: roleSpinner[0].id,
            fromRoleId: roleGinner[0].id,
            outputProductDefinitionId: productDefinition.id
        });
        await facilityTestHelper.create(spinnerUser, UserRoleEnum.SPINNER, { name: 'search-test' });

        return testHelper
            .get('/partners/search/facilities?key=search')
            .authenticate(ginnerToken)
            .isOk()
            .then(({ body }) => {
                expect(body[0]).toMatchObject({
                    name: 'search-test'
                });
            });
    });

    describe('Test cases for invite business facilities', () => {
        it('Invite business facilities fail because invalid role', async () => {
            const adminFacility = await facilityTestHelper.create(adminUser, UserRoleEnum.ADMIN);

            return testHelper
                .post('/partners/invite')
                .authenticate(ginnerToken)
                .send({
                    userInformation: {
                        email: faker.internet.email(),
                        firstName: testHelper.fakeFirstName(),
                        lastName: testHelper.fakeLastName(),
                        phoneNumber: testHelper.fakePhoneNumber()
                    },
                    facilityInformation: {
                        roleId: adminUser.roleId,
                        name: adminFacility.name
                    }
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'You do not have permission to invite this role');
                });
        });

        it('Invite business facilities because email has already been taken', async () => {
            const productDefinition = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleSpinner[0].id,
                fromRoleId: roleGinner[0].id,
                outputProductDefinitionId: productDefinition.id
            });
            return testHelper
                .post('/partners/invite')
                .authenticate(ginnerToken)
                .send({
                    userInformation: {
                        email: ginnerUser.email,
                        firstName: testHelper.fakeFirstName(),
                        lastName: testHelper.fakeLastName(),
                        phoneNumber: testHelper.fakePhoneNumber()
                    },
                    facilityInformation: {
                        roleId: roleGinner[0].id,
                        name: ginnerFacility.name
                    }
                })
                .isValidateError();
        });

        it('Invite business facilities successfully', async () => {
            const spinnerUser = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
            const spinnerFacility = await facilityTestHelper.create(spinnerUser, UserRoleEnum.SPINNER);

            const productDefinition = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleSpinner[0].id,
                fromRoleId: roleGinner[0].id,
                outputProductDefinitionId: productDefinition.id
            });
            return testHelper
                .post('/partners/invite')
                .authenticate(ginnerToken)
                .send({
                    userInformation: {
                        email: faker.internet.email(),
                        firstName: testHelper.fakeFirstName(),
                        lastName: testHelper.fakeLastName(),
                        phoneNumber: testHelper.fakePhoneNumber()
                    },
                    facilityInformation: {
                        roleId: roleSpinner[0].id,
                        name: spinnerFacility.name
                    }
                })
                .isCreated();
        });
    });
});
