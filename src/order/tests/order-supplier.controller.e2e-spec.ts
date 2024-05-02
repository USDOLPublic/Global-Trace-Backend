import assert from 'assert';
import faker from 'faker';
import moment from 'moment';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { OrderSupplierEntity } from '~order/entities/order-supplier.entity';
import { OrderSupplierRepository } from '~order/repositories/order-supplier.repository';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('OrderSupplierController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    const productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);
    const supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);

    let brandUser: UserEntity;
    let brandFacility: FacilityEntity;
    let facility: FacilityEntity;
    let productDefinition: ProductDefinitionEntity;

    let orderId: string;
    let parentId: string;

    beforeAll(async () => {
        await testHelper.initialize();
        brandUser = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        brandFacility = await facilityTestHelper.create(brandUser, UserRoleEnum.BRAND);
        facility = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.FINAL_PRODUCT_ASSEMBLY);

        productDefinition = await productTestHelper.createProductDefinition({
            name: faker.name.title()
        });

        await supplyChainTestHelper.createSupplyChainNode({
            roleId: facility.typeId,
            outputProductDefinitionId: productDefinition.id
        });

        await testHelper
            .post('/orders')
            .authenticate(await userTestHelper.getToken(brandUser))
            .send({
                purchaseOrderNumber: faker.random.alphaNumeric(10),
                purchasedAt: moment().unix(),
                productDescription: 'Description created',
                quantity: faker.random.words(9),
                invoiceNumber: faker.random.words(9),
                packingListNumber: faker.random.words(9),
                supplierId: facility.id
            })
            .isCreated()
            .then(async ({ body }) => {
                orderId = body.id;
                parentId = (await OrderSupplierRepository.make().findOneByOrFail({ orderId })).id;
            });
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Add new order supplier successfully', async () => {
        const millFacility = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.MILL);
        await facilityTestHelper.addPartner(facility, millFacility, brandFacility);

        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: millFacility.typeId,
            roleId: facility.typeId,
            outputProductDefinitionId: productDefinition.id
        });

        return testHelper
            .post(`/orders/${orderId}/suppliers`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .send({
                supplierId: millFacility.id,
                parentId,
                purchaseOrderNumber: faker.random.alphaNumeric(10),
                purchasedAt: moment().unix(),
                invoiceNumber: faker.random.words(9),
                packingListNumber: faker.random.words(9)
            })
            .isCreated()
            .then(async ({ body }) => {
                await testHelper.visibleInDatabase(OrderSupplierEntity, {
                    orderId,
                    supplierId: millFacility.id,
                    parentId,
                    fromSupplierId: facility.id,
                    purchaseOrderNumber: body.purchaseOrderNumber,
                    purchasedAt: body.purchasedAt,
                    invoiceNumber: body.invoiceNumber,
                    packingListNumber: body.packingListNumber
                });
            });
    });

    it('Add new order supplier failed: Parent Id should not be empty', async () => {
        const tmpFacility = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.MILL);
        await facilityTestHelper.addPartner(facility, tmpFacility, brandFacility);
        return testHelper
            .post(`/orders/${orderId}/suppliers`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .send({
                supplierId: tmpFacility.id,
                purchaseOrderNumber: faker.random.alphaNumeric(10),
                purchasedAt: moment().unix(),
                invoiceNumber: faker.random.words(9),
                packingListNumber: faker.random.words(9)
            })
            .isValidateError()
            .has(['errors'])
            .then(async ({ body }) => {
                assert.strictEqual(body.message, 'Validate Exception');
                assert.strictEqual(body.errors.parentId.messages[0], 'Parent Id should not be empty');
            });
    });

    it('Add new order supplier failed: Supplier does not exist in the supply chain map.', async () => {
        const tmpFacility = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.GINNER);
        await facilityTestHelper.addPartner(facility, tmpFacility, brandFacility);

        return testHelper
            .post(`/orders/${orderId}/suppliers`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .send({
                supplierId: tmpFacility.id,
                purchaseOrderNumber: faker.random.alphaNumeric(10),
                purchasedAt: moment().unix(),
                invoiceNumber: faker.random.words(9),
                packingListNumber: faker.random.words(9),
                parentId
            })
            .isNotFound();
    });

    it('Add new order supplier failed: Invalid supplier', async () => {
        const millUser = await userTestHelper.createUser({}, UserRoleEnum.MILL);
        const millFacility = await facilityTestHelper.create(millUser, UserRoleEnum.MILL);
        return testHelper
            .post(`/orders/${orderId}/suppliers`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .send({
                supplierId: millFacility.id,
                parentId,
                purchaseOrderNumber: faker.random.alphaNumeric(10),
                purchasedAt: moment().unix(),
                invoiceNumber: faker.random.words(9),
                packingListNumber: faker.random.words(9)
            })
            .isNotFound();
    });

    it('Delete order supplier successfully', async () => {
        let orderSupplierId: string = null;
        const millFacility = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.MILL);
        await facilityTestHelper.addPartner(facility, millFacility, brandFacility);
        await testHelper
            .post(`/orders/${orderId}/suppliers`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .send({
                supplierId: millFacility.id,
                parentId,
                purchaseOrderNumber: faker.random.alphaNumeric(10),
                purchasedAt: moment().unix(),
                invoiceNumber: faker.random.words(9),
                packingListNumber: faker.random.words(9)
            })
            .isCreated()
            .then(async ({ body }) => {
                orderSupplierId = body.id;
            });

        await testHelper
            .delete(`/orders/${orderId}/suppliers/${orderSupplierId}`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .isNoContent()
            .then(async () => {
                await testHelper.invisibleInDatabase(OrderSupplierEntity, { id: orderSupplierId });
            });
    });
});
