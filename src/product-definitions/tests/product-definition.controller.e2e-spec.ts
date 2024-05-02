import assert from 'assert';
import faker from 'faker';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { AttributeEntity } from '~product-definitions/entities/attribute.entity';
import { ProductDefinitionAttributeEntity } from '~product-definitions/entities/product-definition-attribute.entity';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { AttributeRepository } from '~product-definitions/repositories/attribute.repository';
import { ProductDefinitionAttributeRepository } from '~product-definitions/repositories/product-definition-attribute.repository';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('ProductDefinitionController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let superAdmin: UserEntity;
    let superAdminToken: string;
    let productDefinitionId: string;
    const basePath = '/product-definitions';

    beforeAll(async () => {
        const attributesData: Partial<AttributeEntity>[] = [
            {
                id: '4e31345d-361f-4858-92e1-03c27bace086',
                name: 'Attribute ID',
                type: FieldTypeEnum.PRODUCT_ID,
                category: FieldCategoryEnum.TEXT,
                nameTranslation: { en: 'Attribute ID' }
            },
            {
                id: '57e5b30e-abe5-4b20-a537-a12da4105738',
                name: 'Attribute ID 2',
                type: FieldTypeEnum.PRODUCT_ID,
                category: FieldCategoryEnum.TEXT,
                nameTranslation: { en: 'Attribute ID 2' }
            },
            {
                id: '399771e2-3aaf-49e0-bcc0-040c9a041159',
                name: 'Attribute Quantity',
                type: FieldTypeEnum.PRODUCT_QUANTITY,
                category: FieldCategoryEnum.NUMBER_UNIT_PAIR,
                nameTranslation: { en: 'Attribute Quantity' }
            },
            {
                id: 'c52dff72-9b2f-4d72-af40-3739a8e08a26',
                name: 'Attribute Quantity 2',
                type: FieldTypeEnum.PRODUCT_QUANTITY,
                category: FieldCategoryEnum.NUMBER_UNIT_PAIR,
                nameTranslation: { en: 'Attribute Quantity 2' }
            },
            {
                id: '1eea7d32-37dc-472b-a04b-d9b35653855b',
                name: 'Attribute Other',
                type: FieldTypeEnum.OTHER,
                category: FieldCategoryEnum.NUMBER,
                nameTranslation: { en: 'Attribute Other' }
            }
        ];

        await testHelper.initialize();
        superAdmin = await userTestHelper.createUser({}, UserRoleEnum.SUPER_ADMIN);
        superAdminToken = await userTestHelper.getToken(superAdmin);
        await AttributeRepository.make().save(attributesData);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Super Admin adds a product definition', () => {
        it('Super Admin adds a product definition successfully', () => {
            const attributes = [
                {
                    id: '399771e2-3aaf-49e0-bcc0-040c9a041159',
                    isOptional: false
                },
                {
                    id: '1eea7d32-37dc-472b-a04b-d9b35653855b',
                    isOptional: true
                }
            ];
            const data = {
                name: faker.name.firstName(),
                attributes: attributes.map(({ id, isOptional }, order) => ({ id, isOptional, order }))
            };

            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send(data)
                .isCreated()
                .then(async ({ body }) => {
                    productDefinitionId = body.id;
                    await testHelper.visibleInDatabase(ProductDefinitionEntity, {
                        name: data.name,
                        nameTranslation: { en: data.name }
                    });

                    for await (const [order, { id, isOptional }] of attributes.entries()) {
                        await testHelper.visibleInDatabase(ProductDefinitionAttributeEntity, {
                            productDefinitionId,
                            attributeId: id,
                            isOptional,
                            order
                        });
                    }
                });
        });

        it('Super Admin adds a product definition failed: The product must have only one attribute with type ProductId.', () => {
            const attributes = [
                {
                    id: '4e31345d-361f-4858-92e1-03c27bace086',
                    isOptional: false
                },
                {
                    id: '57e5b30e-abe5-4b20-a537-a12da4105738',
                    isOptional: false
                },
                {
                    id: '399771e2-3aaf-49e0-bcc0-040c9a041159',
                    isOptional: false
                },
                {
                    id: '1eea7d32-37dc-472b-a04b-d9b35653855b',
                    isOptional: true
                }
            ];
            const data = {
                name: 'Product Definition 1',
                attributes: attributes.map(({ id, isOptional }, order) => ({ id, isOptional, order }))
            };

            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send(data)
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'The product must have only one attribute with type ProductId.');
                });
        });

        it('Super Admin adds a product definition failed: The product must have one attribute with type Product Quantity.', () => {
            const attributes = [
                {
                    id: '4e31345d-361f-4858-92e1-03c27bace086',
                    isOptional: false
                },
                {
                    id: '1eea7d32-37dc-472b-a04b-d9b35653855b',
                    isOptional: true
                }
            ];
            const data = {
                name: 'Product Definition 1',
                attributes: attributes.map(({ id, isOptional }, order) => ({ id, isOptional, order }))
            };

            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send(data)
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'The product must have one attribute with type Product Quantity.');
                });
        });

        it('Super Admin adds a product definition failed: The product must have only one attribute with type Product Quantity.', () => {
            const attributes = [
                {
                    id: '4e31345d-361f-4858-92e1-03c27bace086',
                    isOptional: false
                },
                {
                    id: '399771e2-3aaf-49e0-bcc0-040c9a041159',
                    isOptional: false
                },
                {
                    id: 'c52dff72-9b2f-4d72-af40-3739a8e08a26',
                    isOptional: false
                },
                {
                    id: '1eea7d32-37dc-472b-a04b-d9b35653855b',
                    isOptional: true
                }
            ];
            const data = {
                name: 'Product Definition 1',
                attributes: attributes.map(({ id, isOptional }, order) => ({ id, isOptional, order }))
            };

            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send(data)
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(
                        body.message,
                        'The product must have only one attribute with type Product Quantity.'
                    );
                });
        });

        it('Super Admin adds a product definition failed: The property with type Product Quantity must be required.', () => {
            const attributes = [
                {
                    id: '4e31345d-361f-4858-92e1-03c27bace086',
                    isOptional: false
                },
                {
                    id: 'c52dff72-9b2f-4d72-af40-3739a8e08a26',
                    isOptional: true
                },
                {
                    id: '1eea7d32-37dc-472b-a04b-d9b35653855b',
                    isOptional: true
                }
            ];
            const data = {
                name: 'Product Definition 1',
                attributes: attributes.map(({ id, isOptional }, order) => ({ id, isOptional, order }))
            };

            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send(data)
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'The property with type Product Quantity must be required.');
                });
        });

        it('Super Admin adds a product definition failed: The property with type Product Quantity must be used in all transaction.', () => {
            const attributes = [
                {
                    id: '4e31345d-361f-4858-92e1-03c27bace086',
                    isOptional: false
                },
                {
                    id: 'c52dff72-9b2f-4d72-af40-3739a8e08a26',
                    isOptional: false,
                    isAddManuallyOnly: true
                },
                {
                    id: '1eea7d32-37dc-472b-a04b-d9b35653855b',
                    isOptional: true
                }
            ];
            const data = {
                name: 'Product Definition 1',
                attributes: attributes.map(({ id, isOptional, isAddManuallyOnly }, order) => ({
                    id,
                    isOptional,
                    isAddManuallyOnly,
                    order
                }))
            };

            return testHelper
                .post(basePath)
                .authenticate(superAdminToken)
                .send(data)
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(
                        body.message,
                        'The property with type Product Quantity must be used in all transaction.'
                    );
                });
        });
    });

    describe('Super Admin gets a product definition', () => {
        it('Super Admin gets a product definition successfully', () => {
            return testHelper.get(`/product-definitions/${productDefinitionId}`).authenticate(superAdminToken).isOk();
        });
    });

    describe('Super Admin gets all product definitions', () => {
        it('Super Admin gets all product definitions successfully', () => {
            return testHelper.get(basePath).authenticate(superAdminToken).isOk();
        });
    });

    describe('Super Admin edits a product definition', () => {
        it('Super Admin edits a product definition successfully', () => {
            const attributes = [
                {
                    id: '4e31345d-361f-4858-92e1-03c27bace086',
                    isOptional: false
                },
                {
                    id: '399771e2-3aaf-49e0-bcc0-040c9a041159',
                    isOptional: false
                },
                {
                    id: '1eea7d32-37dc-472b-a04b-d9b35653855b',
                    isOptional: true
                }
            ];
            const editData = {
                name: 'Product 1 Updated',
                attributes: attributes.map(({ id, isOptional }, order) => ({ id, isOptional, order }))
            };

            return testHelper
                .put(`/product-definitions/${productDefinitionId}`)
                .authenticate(superAdminToken)
                .send(editData)
                .isNoContent()
                .then(async () => {
                    for await (const [order, { id, isOptional }] of attributes.entries()) {
                        await testHelper.visibleInDatabase(ProductDefinitionAttributeEntity, {
                            productDefinitionId,
                            attributeId: id,
                            isOptional,
                            order
                        });
                    }

                    const count = await ProductDefinitionAttributeRepository.make().count({
                        where: { productDefinitionId }
                    });
                    expect(count).toEqual(attributes.length);
                });
        });
    });

    describe('Check role guard', () => {
        it('Admin can not access API', async () => {
            const admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
            return testHelper
                .get(basePath)
                .authenticate(await userTestHelper.getToken(admin))
                .isForbiddenError();
        });
    });

    describe('Get product definition of user', () => {
        let productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);
        let supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
        let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
        let spinner: UserEntity;
        let spinnerToken: string;
        let ginner: UserEntity;
        let mill: UserEntity;
        let millToken: string;

        beforeAll(async () => {
            spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
            await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);
            spinnerToken = await userTestHelper.getToken(spinner);

            ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);

            mill = await userTestHelper.createUser({}, UserRoleEnum.MILL);
            await facilityTestHelper.create(mill, UserRoleEnum.MILL);
            millToken = await userTestHelper.getToken(mill);
        });

        it('Get purchased product definition of user: User is not allowed to purchase the products.', async () => {
            return testHelper
                .get(`${basePath}/purchased-product-definitions`)
                .authenticate(spinnerToken)
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'User is not allowed to purchase the products.');
                });
        });

        it('Get purchased product definition of user successfully', async () => {
            const purchasedProductDefinition = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            const soldProductDefinition = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            await supplyChainTestHelper.createSupplyChainNode({
                fromRoleId: null,
                roleId: ginner.roleId,
                outputProductDefinitionId: purchasedProductDefinition.id
            });
            await supplyChainTestHelper.createSupplyChainNode({
                fromRoleId: ginner.roleId,
                roleId: spinner.roleId,
                outputProductDefinitionId: soldProductDefinition.id
            });

            return testHelper
                .get(`${basePath}/purchased-product-definitions`)
                .authenticate(spinnerToken)
                .isOk()
                .then(({ body }) => {
                    assert.strictEqual(body.id, purchasedProductDefinition.id);
                });
        });

        it('Get sold product definition of user', async () => {
            const soldProductDefinition = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            await supplyChainTestHelper.createSupplyChainNode({
                fromRoleId: spinner.roleId,
                roleId: mill.roleId,
                outputProductDefinitionId: soldProductDefinition.id
            });

            return testHelper
                .get(`${basePath}/sold-product-definitions`)
                .authenticate(millToken)
                .isOk()
                .then(({ body }) => {
                    assert.strictEqual(body.id, soldProductDefinition.id);
                });
        });
    });
});
