import assert from 'assert';
import faker from 'faker';
import moment from 'moment';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { OrderSupplierEntity } from '~order/entities/order-supplier.entity';
import { OrderEntity } from '~order/entities/order.entity';
import { OrderTestHelper } from '~order/tests/order-test.helper';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('OrderController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let orderTestHelper = testHelper.getTestHelperModule(OrderTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    const productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);
    const supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);

    let brandUser: UserEntity;
    let millFacility: FacilityEntity;
    let brandFacility: FacilityEntity;
    let productDefinition: ProductDefinitionEntity;

    beforeAll(async () => {
        await testHelper.initialize();
        brandUser = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        brandFacility = await facilityTestHelper.create(brandUser, UserRoleEnum.BRAND);
        millFacility = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.MILL);

        productDefinition = await productTestHelper.createProductDefinition({
            name: faker.name.title()
        });
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Add new order successfully', async () => {
        await supplyChainTestHelper.createSupplyChainNode({
            roleId: millFacility.typeId,
            outputProductDefinitionId: productDefinition.id
        });

        return testHelper
            .post('/orders')
            .authenticate(await userTestHelper.getToken(brandUser))
            .send({
                purchaseOrderNumber: faker.random.alphaNumeric(10),
                purchasedAt: moment().unix(),
                productDescription: 'Description created',
                quantity: faker.random.words(9),
                invoiceNumber: faker.random.words(9),
                packingListNumber: faker.random.words(9),
                supplierId: millFacility.id
            })
            .isCreated()
            .then(async ({ body }) => {
                assert(body.productDescription, 'Description created');
                await testHelper.visibleInDatabase(OrderEntity, {
                    id: body.id,
                    supplierId: millFacility.id,
                    facilityId: brandFacility.id
                });
                await testHelper.visibleInDatabase(OrderSupplierEntity, {
                    orderId: body.id,
                    supplierId: millFacility.id,
                    purchaseOrderNumber: body.purchaseOrderNumber,
                    purchasedAt: body.purchasedAt,
                    invoiceNumber: body.invoiceNumber,
                    packingListNumber: body.packingListNumber
                });
            });
    });

    it('Add new order failed: Supplier does not exist in the supply chain map.', async () => {
        const spinnerFacility = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.SPINNER);
        return testHelper
            .post('/orders')
            .authenticate(await userTestHelper.getToken(brandUser))
            .send({
                purchaseOrderNumber: faker.random.alphaNumeric(10),
                purchasedAt: moment().unix(),
                productDescription: 'Description created',
                quantity: faker.random.words(9),
                invoiceNumber: faker.random.words(9),
                packingListNumber: faker.random.words(9),
                supplierId: spinnerFacility.id
            })
            .isValidateError()
            .has(['errors'])
            .then(async ({ body }) => {
                assert.strictEqual(body.message, 'Supplier does not exist in the supply chain map.');
            });
    });

    it('Update order successfully', async () => {
        let orderId: string;
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
                supplierId: millFacility.id
            })
            .isCreated()
            .then(async ({ body }) => {
                orderId = body.id;
            });

        const facility = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.FINAL_PRODUCT_ASSEMBLY);
        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: millFacility.typeId,
            roleId: facility.typeId,
            outputProductDefinitionId: productDefinition.id
        });

        await testHelper
            .put(`/orders/${orderId}`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .send({
                productDescription: 'Update Order',
                purchaseOrderNumber: faker.random.alphaNumeric(10),
                purchasedAt: moment().unix(),
                quantity: faker.random.words(9),
                invoiceNumber: faker.random.words(9),
                packingListNumber: faker.random.words(9),
                supplierId: facility.id
            })
            .isNoContent();

        await testHelper.visibleInDatabase(OrderEntity, {
            id: orderId,
            facilityId: brandFacility.id,
            supplierId: facility.id
        });

        await testHelper.visibleInDatabase(OrderSupplierEntity, {
            orderId,
            supplierId: facility.id
        });
    });

    it('Delete order successfully', async () => {
        const order = await orderTestHelper.createOrder(brandUser, brandFacility, millFacility);

        await testHelper
            .delete(`/orders/${order.id}`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .isNoContent()
            .then(async () => {
                await testHelper.invisibleInDatabase(OrderEntity, { id: order.id });
            });
    });

    it('Get list order successfully', async () => {
        await testHelper
            .get('/orders?sortFields=updatedAt:ASC')
            .authenticate(await userTestHelper.getToken(brandUser))
            .isOk()
            .isPagination()
            .then(({ body }) => {
                expect(body).toHaveProperty('items');
            });
    });
});
