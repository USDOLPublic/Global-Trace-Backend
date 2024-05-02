import { TestHelper } from '~core/tests/test.helper';
import { ProductEntity } from '~products/entities/product.entity';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { PermissionRepository } from '~role-permissions/repositories/permission.repository';
import { RolePermissionTestHelper } from '~role-permissions/tests/role-permission-test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';
import { SupplyChainTestHelper } from './supply-chain-test.helper';
import assert from 'assert';

describe('SupplyChainController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let rolePermissionTestHelper = testHelper.getTestHelperModule(RolePermissionTestHelper);
    let productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);
    let supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
    let superAdmin: UserEntity;
    let superAdminToken: string;
    let roleFarm: RoleEntity;
    let roleGinner: RoleEntity;
    let roleSpinner: RoleEntity;
    let roleMill: RoleEntity;
    let nodeId: string;
    let product: ProductEntity;
    let logPurchasePermission: PermissionEntity;
    let logSalePermission: PermissionEntity;
    const basePath = '/supply-chain-nodes';

    const wrongId = '00000000-0000-0000-0000-000000000000';

    beforeAll(async () => {
        await testHelper.initialize();
        superAdmin = await userTestHelper.createUser({}, UserRoleEnum.SUPER_ADMIN);
        superAdminToken = await userTestHelper.getToken(superAdmin);

        roleFarm = await rolePermissionTestHelper.createRole({ name: 'Farm', type: RoleTypeEnum.PRODUCT });
        roleGinner = await rolePermissionTestHelper.createRole({ name: 'Ginner', type: RoleTypeEnum.PRODUCT });
        roleSpinner = await rolePermissionTestHelper.createRole({ name: 'Spinner', type: RoleTypeEnum.PRODUCT });
        roleMill = await rolePermissionTestHelper.createRole({ name: 'Mill', type: RoleTypeEnum.PRODUCT });
        product = await productTestHelper.createProduct();

        logPurchasePermission = await PermissionRepository.make().findOneBy({
            action: PermissionEnum.LOG_PURCHASE
        });
        logSalePermission = await PermissionRepository.make().findOneBy({
            action: PermissionEnum.LOG_SALE
        });
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Super Admin adds supply chain node', () => {
        it('Super Admin adds farm as a first supply chain node successfully', async () => {
            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send({
                    roleId: roleFarm.id,
                    fromRoleId: null,
                    outputProductDefinitionId: product.productDefinitionId,
                    position: {
                        top: 10,
                        left: 10
                    }
                })
                .isCreated();
        });

        it('Super Admin can not add supply chain node if the from-role is not added yet', async () => {
            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send({
                    roleId: roleSpinner.id,
                    fromRoleId: roleGinner.id,
                    outputProductDefinitionId: product.productDefinitionId,
                    position: {
                        top: 10,
                        left: 10
                    }
                })
                .isValidateError();
        });

        it('Super Admin can supply node failed: Spinner is not allow to purchase', async () => {
            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send({
                    roleId: roleSpinner.id,
                    fromRoleId: roleFarm.id,
                    outputProductDefinitionId: product.productDefinitionId,
                    position: {
                        top: 10,
                        left: 10
                    }
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Spinner is not allowed to purchase.');
                });
        });

        it('Super Admin adds spinner as purchaser of farm successfully', async () => {
            await rolePermissionTestHelper.assignPermissions(roleSpinner.id, [logPurchasePermission.id]);

            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send({
                    roleId: roleSpinner.id,
                    fromRoleId: roleFarm.id,
                    outputProductDefinitionId: product.productDefinitionId,
                    position: {
                        top: 10,
                        left: 10
                    }
                })
                .isCreated();
        });

        it('Super Admin adds mill as purchaser of spinner failed: Spinner is not allow to sell', async () => {
            await rolePermissionTestHelper.assignPermissions(roleMill.id, [logPurchasePermission.id]);

            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send({
                    roleId: roleMill.id,
                    fromRoleId: roleSpinner.id,
                    outputProductDefinitionId: product.productDefinitionId,
                    position: {
                        top: 10,
                        left: 10
                    }
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Spinner is not allowed to sell.');
                });
        });

        it('Super admin adds mill as purchaser of spinner successfully', async () => {
            await rolePermissionTestHelper.assignPermissions(roleSpinner.id, [logSalePermission.id]);

            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send({
                    roleId: roleMill.id,
                    fromRoleId: roleSpinner.id,
                    outputProductDefinitionId: product.productDefinitionId,
                    position: {
                        top: 10,
                        left: 10
                    }
                })
                .isCreated()
                .then(async ({ body }) => {
                    nodeId = body.id;
                });
        });

        it('Super Admin can not add duplicated supply chain node', async () => {
            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send({
                    roleId: roleMill.id,
                    fromRoleId: roleSpinner.id,
                    outputProductDefinitionId: product.productDefinitionId,
                    position: {
                        top: 10,
                        left: 10
                    }
                })
                .isValidateError();
        });
    });

    describe('Super Admin edits supply chain node', () => {
        it('Super Admin can not edit node', async () => {
            return testHelper
                .put(`${basePath}/${nodeId}`)
                .authenticate(superAdminToken)
                .send({
                    roleId: roleMill.id,
                    fromRoleId: roleMill.id,
                    outputProductDefinitionId: product.productDefinitionId,
                    position: {
                        top: 10,
                        left: 10
                    }
                })
                .isValidateError();
        });

        it('Super Admin edits supply chain node successfully', async () => {
            const roleBroker = await rolePermissionTestHelper.createRole(
                {
                    name: 'Broker',
                    type: RoleTypeEnum.PRODUCT
                },
                [logPurchasePermission.id]
            );

            return testHelper
                .put(`${basePath}/${nodeId}`)
                .authenticate(superAdminToken)
                .send({
                    roleId: roleBroker.id,
                    fromRoleId: roleSpinner.id,
                    outputProductDefinitionId: product.productDefinitionId,
                    position: {
                        top: 10,
                        left: 10
                    }
                })
                .isNoContent();
        });
    });

    describe('Super Admin delete supply chain node', () => {
        beforeAll(async () => {
            roleFarm = await rolePermissionTestHelper.createRole({ name: 'Farm' });
            roleGinner = await rolePermissionTestHelper.createRole({ name: 'Ginner' });
            roleSpinner = await rolePermissionTestHelper.createRole({ name: 'Spinner' });
            const { id } = await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleSpinner.id,
                outputProductDefinitionId: product.productDefinitionId
            });
            nodeId = id;
            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleGinner.id,
                fromRoleId: roleSpinner.id,
                outputProductDefinitionId: product.productDefinitionId
            });
            await supplyChainTestHelper.createSupplyChainNode({
                roleId: roleFarm.id,
                fromRoleId: roleGinner.id,
                outputProductDefinitionId: product.productDefinitionId
            });
        });

        it('Super Admin delete a supply chain node and remove its connections successfully', async () => {
            return testHelper.delete(`/supply-chain-nodes/${nodeId}`).authenticate(superAdminToken).isNoContent();
        });

        it('Delete fail: wrong nodeId', async () => {
            return testHelper.delete(`/supply-chain-nodes/${wrongId}`).authenticate(superAdminToken).isNotFound();
        });
    });
});
