import assert from 'assert';
import faker from 'faker';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('FacilityController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    const supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
    const productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);

    let adminToken;
    let adminUser;
    let brandUser: UserEntity;
    let ginnerFacility: FacilityEntity;
    let brandFacility: FacilityEntity;

    async function checkUpdateOarId(objUser: UserEntity, oarId: string, objFacility: FacilityEntity) {
        await testHelper
            .put(`/facilities/oarIds`)
            .send({ oarId })
            .authenticate(await userTestHelper.getToken(objUser))
            .isNoContent()
            .then(async (body) => {
                await testHelper.visibleInDatabase(FacilityEntity, { id: objFacility.id, oarId });
            });
    }

    function checkFacilityName(body: FacilityEntity, facilityName: string): void {
        expect(body[0]).toMatchObject({
            name: facilityName
        });
    }

    beforeAll(async () => {
        await testHelper.initialize();
        adminUser = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        await userTestHelper.assignPermission(adminUser.id, PermissionEnum.SUBMIT_GRIEVANCE_REPORTS);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Get list facilities successfully', async () => {
        adminToken = await userTestHelper.getToken(adminUser);
        await facilityTestHelper.create(adminUser, UserRoleEnum.GINNER);
        return testHelper.get('/facilities').authenticate(adminToken).isOk();
    });

    it('Search facilities by key name successfully', async () => {
        adminToken = await userTestHelper.getToken(adminUser);
        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        await facilityTestHelper.create(ginner, UserRoleEnum.GINNER, { name: 'search-test' });
        return testHelper
            .get('/facilities?key=search')
            .authenticate(adminToken)
            .isOk()
            .then(({ body }) => {
                expect(body[0]).toMatchObject({
                    name: 'search-test'
                });
            });
    });

    it('Search facilities by key name failed', async () => {
        adminToken = await userTestHelper.getToken(adminUser);
        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);
        return testHelper
            .get('/facilities?key=9999')
            .authenticate(adminToken)
            .isOk()
            .then(({ body }) => {
                expect(body).toHaveLength(0);
            });
    });

    it('Search facilities by key name successfully with role admin', async () => {
        adminToken = await userTestHelper.getToken(adminUser);
        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);
        await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);
        return testHelper
            .get('/facilities?key=ginner')
            .authenticate(adminToken)
            .isOk()
            .then(({ body }) => {
                expect(body[0]).toMatchObject({
                    name: 'Ginner Facility'
                });
            });
    });

    describe('Test case for search FARM GROUP AND FARM', () => {
        let farmMonitor: UserEntity;
        let farmGroup: FacilityEntity;
        let farmGroup2: FacilityEntity;
        let farms: FacilityEntity[];

        beforeAll(async () => {
            farmMonitor = await userTestHelper.createUser({}, UserRoleEnum.FARM_MONITOR);
            await facilityTestHelper.create(farmMonitor, UserRoleEnum.FARM_MONITOR);
            await userTestHelper.assignPermission(farmMonitor.id, PermissionEnum.SUBMIT_REPORTS);

            farmGroup = await facilityTestHelper.createFarmGroup({ name: 'FarmGroup 123' });
            farmGroup2 = await facilityTestHelper.createFarmGroup({ name: 'FarmGroup 456' });

            farms = await facilityTestHelper.createFarms(farmGroup.id, 5);
        });

        it('Search FARM GROUP by name successfully', async () => {
            return testHelper
                .get('/facilities?key=FarmGroup')
                .authenticate(await userTestHelper.getToken(farmMonitor))
                .isOk()
                .then(({ body }) => {
                    expect(body).toHaveLength(2);
                    expect([farmGroup.id, farmGroup2.id]).toEqual(expect.arrayContaining([body[0].id, body[1].id]));
                });
        });

        it('Search FARM by id successfully', async () => {
            return testHelper
                .get(`/facilities?key=${farms[0].farmId}`)
                .authenticate(await userTestHelper.getToken(farmMonitor))
                .isOk()
                .then(({ body }) => {
                    expect(body).toHaveLength(1);
                    assert.strictEqual(body[0].id, farms[0].id);
                });
        });

        it('Search FARM by id not found farm successfully', async () => {
            return testHelper
                .get('/facilities?key=6666-222')
                .authenticate(await userTestHelper.getToken(farmMonitor))
                .isOk()
                .then(({ body }) => {
                    expect(body).toHaveLength(0);
                });
        });
    });

    it('Search facilities by key name failed with role admin', async () => {
        adminToken = await userTestHelper.getToken(adminUser);
        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        const farmMonitor = await userTestHelper.createUser({}, UserRoleEnum.FARM_MONITOR);
        await facilityTestHelper.create(farmMonitor, UserRoleEnum.FARM_MONITOR);
        await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);
        return testHelper
            .get('/facilities?key=farm')
            .authenticate(adminToken)
            .isOk()
            .then(({ body }) => {
                expect(body).toHaveLength(3);
            });
    });

    it('Search facilities by key name failed with role farm', async () => {
        const transport = await userTestHelper.createUser({}, UserRoleEnum.TRANSPORTER);
        const farmMonitor = await userTestHelper.createUser({}, UserRoleEnum.FARM_MONITOR);
        await userTestHelper.assignPermission(farmMonitor.id, PermissionEnum.SUBMIT_REPORTS);
        await facilityTestHelper.create(farmMonitor, UserRoleEnum.FARM_MONITOR);
        await facilityTestHelper.create(transport, UserRoleEnum.TRANSPORTER);
        return testHelper
            .get('/facilities?key=transport')
            .authenticate(await userTestHelper.getToken(farmMonitor))
            .isOk()
            .then(({ body }) => {
                expect(body).toHaveLength(0);
            });
    });

    it('Get list and search suppliers successfully', async () => {
        brandUser = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        brandFacility = await facilityTestHelper.create(brandUser, UserRoleEnum.BRAND);
        let ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER, {
            chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
            name: 'Ginner Facility'
        });
        await facilityTestHelper.addPartner(brandFacility, ginnerFacility);

        const productDefinition = await productTestHelper.createProductDefinition({
            name: faker.name.title()
        });
        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: null,
            roleId: ginner.roleId,
            outputProductDefinitionId: productDefinition.id
        });

        await testHelper
            .get('/facilities/list?key=Ginner')
            .authenticate(await userTestHelper.getToken(brandUser))
            .isOk()
            .then(({ body }) => {
                checkFacilityName(body, 'Ginner Facility');
            });
    });

    it('Get information suppliers by id successfully', async () => {
        brandUser = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        brandFacility = await facilityTestHelper.create(brandUser, UserRoleEnum.BRAND);
        const ginnerSupplier = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.GINNER);

        await testHelper
            .get(`/facilities/${ginnerSupplier.id}`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .isOk()
            .then(({ body }) => {
                expect(body).toMatchObject({ id: ginnerSupplier.id });
            });
    });

    it('Brand still cal get supplier information if not added this one', async () => {
        brandFacility = await facilityTestHelper.create(
            await userTestHelper.createUser({}, UserRoleEnum.BRAND),
            UserRoleEnum.BRAND
        );
        const ginnerSupplier2 = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.GINNER);
        const anotherBrandContactor = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        await facilityTestHelper.create(anotherBrandContactor, UserRoleEnum.BRAND);

        await testHelper
            .get(`/facilities/${ginnerSupplier2.id}`)
            .authenticate(await userTestHelper.getToken(anotherBrandContactor))
            .isOk();
    });

    it('Get business partner by facilityId successfully', async () => {
        brandUser = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        brandFacility = await facilityTestHelper.create(brandUser, UserRoleEnum.BRAND);
        let ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.FINAL_PRODUCT_ASSEMBLY, {
            chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
            name: 'Ginner Facility'
        });
        await facilityTestHelper.addPartner(brandFacility, ginnerFacility);

        await testHelper
            .get(`/facilities/${brandFacility.id}/business-partner`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .isOk()
            .then(({ body }) => {
                checkFacilityName(body, 'Ginner Facility');
            });
    });

    describe('Test cases for update OAR ID', () => {
        const oarId = faker.datatype.string(10);
        let ginner: UserEntity;

        beforeAll(async () => {
            ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
            ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);
        });

        it('Update OAR ID for current user successfully', async () => {
            await checkUpdateOarId(ginner, oarId, ginnerFacility);
        });

        it('Update OAR ID for current user again still successfully', async () => {
            await checkUpdateOarId(ginner, oarId, ginnerFacility);
        });

        it('Update OAR ID for current user fail because already used for another user', async () => {
            const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
            await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);

            await testHelper
                .put(`/facilities/oarIds`)
                .send({ oarId })
                .authenticate(await userTestHelper.getToken(spinner))
                .isValidateError();
        });
    });
});
