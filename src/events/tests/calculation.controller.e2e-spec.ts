import faker from 'faker';
import { readFileSync } from 'fs';
import moment from 'moment';
import path from 'path';
import { env } from '~config/env.config';
import { TestHelper } from '~core/tests/test.helper';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { PermissionRepository } from '~role-permissions/repositories/permission.repository';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { RolePermissionTestHelper } from '~role-permissions/tests/role-permission-test.helper';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('CalculationController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    let supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
    let productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);
    let rolePermissionTestHelper = testHelper.getTestHelperModule(RolePermissionTestHelper);
    let spinner: UserEntity;
    let ginner: UserEntity;
    let spinnerFacility: FacilityEntity;
    let spinnerToken: string;
    let ginnerFacility: FacilityEntity;
    let millFacility: FacilityEntity;
    let productDefinition: ProductDefinitionEntity;

    beforeAll(async () => {
        await testHelper.initialize();
        spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);
        const roleSpinner = await RoleRepository.make().findOneBy({
            name: UserRoleEnum.SPINNER
        });
        const marginErrorPermission = await PermissionRepository.make().findOneBy({
            action: PermissionEnum.VIEW_MARGIN_OF_ERROR
        });
        await rolePermissionTestHelper.assignPermissions(roleSpinner.id, [marginErrorPermission.id]);
        spinnerToken = await userTestHelper.getToken(spinner);

        ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);
        await facilityTestHelper.addPartner(spinnerFacility, ginnerFacility);

        const mill = await userTestHelper.createUser({}, UserRoleEnum.MILL);
        millFacility = await facilityTestHelper.create(mill, UserRoleEnum.MILL);
        await facilityTestHelper.addPartner(spinnerFacility, millFacility);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Upload proof successfully', () => {
        return testHelper
            .post('/upload/files')
            .authenticate(spinnerToken)
            .type('form')
            .attach(
                'files',
                readFileSync(path.join(env.ROOT_PATH, 'core/tests/assets/dev-test-image.png')),
                'dev-test-image.png'
            )
            .isCreated()
            .then(({ body }) => {
                expect(body).toHaveLength(1);
                expect(body[0]).toHaveProperty('blobName');
                expect(body[0]).toHaveProperty('url');
            });
    });

    it('Calculate total inputs and outputs filter by time range', async () => {
        productDefinition = await productTestHelper.createProductDefinition({
            name: faker.name.title()
        });
        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: null,
            roleId: ginner.roleId,
            outputProductDefinitionId: productDefinition.id
        });
        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: ginner.roleId,
            roleId: spinner.roleId,
            outputProductDefinitionId: productDefinition.id
        });
        const yesterday = moment().subtract(1, 'days').unix();
        return testHelper
            .get(`/calculations?from=${yesterday}&to=${moment().unix()}`)
            .authenticate(spinnerToken)
            .isOk()
            .then(({ body }) => {
                expect(body).toMatchObject({
                    totalInputs: {
                        canCalculate: true,
                        value: 0
                    },
                    totalOutputs: {
                        canCalculate: true,
                        value: 0
                    },
                    totalByProduct: {
                        canCalculate: true,
                        value: 0
                    }
                });
            });
    });

    it('Calculate mass balance filter by time range', async () => {
        const yesterday = moment().subtract(1, 'days').unix();
        return testHelper
            .get(`/calculations/margin-of-error?from=${yesterday}&to=${moment().unix()}`)
            .authenticate(spinnerToken)
            .isOk()
            .then(({ body }) => {
                expect(body).toMatchObject({
                    value: 0,
                    canCalculate: true
                });
            });
    });

    it('Calculate mass balance filter by time range', async () => {
        const yesterday = moment().subtract(1, 'days').unix();
        return testHelper
            .get(`/calculations/mass-balance?from=${yesterday}&to=${moment().unix()}`)
            .authenticate(spinnerToken)
            .isOk()
            .then(({ body }) => {
                expect(body).toMatchObject({
                    verifiedQuantity: 0,
                    notVerifiedQuantity: 0,
                    quantityUnit: WeightUnitEnum.KG,
                    canCalculate: true
                });
            });
    });
});
