import assert from 'assert';
import faker from 'faker';
import { readFileSync } from 'fs';
import _ from 'lodash';
import moment from 'moment';
import path from 'path';
import { env } from '~config/env.config';
import { TestHelper } from '~core/tests/test.helper';
import { TP_MAIN_WEIGHT_UNITS } from '~events/constants/tp-main-weight-units.constant';
import { CurrencyEnum } from '~events/enums/currency.enum';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { AttributeEntity } from '~product-definitions/entities/attribute.entity';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { AttributeRepository } from '~product-definitions/repositories/attribute.repository';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { QrCodeStatusEnum } from '~qr-codes/enums/qr-code-status.enum';
import { QrCodeRepository } from '~qr-codes/repositories/qr-code.repository';
import { QrCodeTestHelper } from '~qr-codes/tests/qr-code-test.helper';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { PermissionRepository } from '~role-permissions/repositories/permission.repository';
import { RoleRepository } from '~role-permissions/repositories/role.repository';
import { RolePermissionTestHelper } from '~role-permissions/tests/role-permission-test.helper';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('EventController (e2e)', () => {
    const testHelper = new TestHelper();
    const userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    const productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);
    const qrCodeTestHelper = testHelper.getTestHelperModule(QrCodeTestHelper);
    const facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    const supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
    const rolePermissionTestHelper = testHelper.getTestHelperModule(RolePermissionTestHelper);
    let farmRole: RoleEntity;
    let spinner: UserEntity;
    let spinnerFacility: FacilityEntity;
    let spinnerToken: string;
    let ginner: UserEntity;
    let ginnerFacility: FacilityEntity;
    let ginnerToken: string;
    let mill: UserEntity;
    let millFacility: FacilityEntity;
    let millToken: string;
    let transporter: UserEntity;
    let transportFacility: FacilityEntity;
    let productDefinition: ProductDefinitionEntity;
    let uploadBlobName: string;
    let fileName: string = 'dev-test-image.png';
    const wrongId = '00000000-0000-0000-0000-000000000000';
    const basePath = '/events';

    async function getQrCode(body: any): Promise<string> {
        const qrCodeBatchId = body.id;
        const qrCode = await QrCodeRepository.make().findOneByOrFail({ qrCodeBatchId });
        return qrCode.code;
    }

    beforeAll(async () => {
        await testHelper.initialize();

        farmRole = await RoleRepository.make().findOneBy({ name: UserRoleEnum.FARM });

        spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);
        spinnerToken = await userTestHelper.getToken(spinner);

        ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);
        ginnerToken = await userTestHelper.getToken(ginner);

        mill = await userTestHelper.createUser({}, UserRoleEnum.MILL);
        millFacility = await facilityTestHelper.create(mill, UserRoleEnum.MILL);
        millToken = await userTestHelper.getToken(mill);

        transporter = await userTestHelper.createUser({}, UserRoleEnum.TRANSPORTER);
        transportFacility = await facilityTestHelper.create(transporter, UserRoleEnum.TRANSPORTER);

        await RoleRepository.make().update(ginner.roleId, { chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE });

        const attributes: Partial<AttributeEntity>[] = [
            {
                id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                name: 'ProductID',
                type: FieldTypeEnum.PRODUCT_ID,
                category: FieldCategoryEnum.TEXT,
                nameTranslation: { en: 'Attribute ID' }
            },
            {
                id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                name: 'NumberAttribute',
                type: FieldTypeEnum.OTHER,
                category: FieldCategoryEnum.NUMBER
            },
            {
                id: '32ee8d26-a316-4c80-a2e7-6d32e9db6bba',
                name: 'PercentageAttribute',
                type: FieldTypeEnum.OTHER,
                category: FieldCategoryEnum.PERCENTAGE
            },
            {
                id: '5d8641f0-a0f5-4e3b-a642-0bb871c281a5',
                name: 'DateAttribute',
                type: FieldTypeEnum.OTHER,
                category: FieldCategoryEnum.DATE
            },
            {
                id: '8bbe47d2-1051-4e16-926b-3b4376f7db4e',
                name: 'ListAttribute',
                type: FieldTypeEnum.OTHER,
                category: FieldCategoryEnum.LIST,
                options: [
                    { value: 'Option1', translation: { en: 'Option1' } },
                    { value: 'Option2', translation: { en: 'Option2' } }
                ]
            },
            {
                id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                name: 'ProductQuantity',
                nameTranslation: { en: 'Attribute Quantity' },
                type: FieldTypeEnum.PRODUCT_QUANTITY,
                category: FieldCategoryEnum.NUMBER_UNIT_PAIR,
                options: [
                    { value: 'Unit 1', translation: { en: 'Unit 1' } },
                    { value: 'Unit 2', translation: { en: 'Unit 2' } },
                    { value: 'Kg', translation: { en: 'Kg' } }
                ]
            },
            {
                id: '7aedc9e1-b881-4cdc-a672-3c98b260dc7c',
                name: 'CountryProvinceDistrictAttribute',
                type: FieldTypeEnum.OTHER,
                category: FieldCategoryEnum.COUNTRY_PROVINCE_DISTRICT
            },
            {
                id: '3d94265d-b9b3-4ba5-96af-008a66d8a85b',
                name: 'AttachAttribute',
                type: FieldTypeEnum.OTHER,
                category: FieldCategoryEnum.ATTACHMENTS
            }
        ];

        await AttributeRepository.make().save(attributes);

        productDefinition = await productTestHelper.createProductDefinition(
            {
                name: faker.name.title()
            },
            [
                {
                    id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                    isOptional: false,
                    order: 1
                },
                {
                    id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                    isOptional: false,
                    order: 2
                },
                {
                    id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                    isOptional: true,
                    order: 3
                },
                {
                    id: '32ee8d26-a316-4c80-a2e7-6d32e9db6bba',
                    isOptional: true,
                    order: 4
                },
                {
                    id: '8bbe47d2-1051-4e16-926b-3b4376f7db4e',
                    isOptional: true,
                    order: 5
                },
                {
                    id: '7aedc9e1-b881-4cdc-a672-3c98b260dc7c',
                    isOptional: true,
                    order: 6
                }
            ]
        );

        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: null,
            roleId: farmRole.id,
            outputProductDefinitionId: productDefinition.id
        });
        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: farmRole.id,
            roleId: ginner.roleId,
            outputProductDefinitionId: productDefinition.id
        });
        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: ginner.roleId,
            roleId: spinner.roleId,
            outputProductDefinitionId: productDefinition.id
        });
        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: spinner.roleId,
            roleId: mill.roleId,
            outputProductDefinitionId: productDefinition.id
        });

        await facilityTestHelper.addPartner(ginnerFacility, spinnerFacility);
        await facilityTestHelper.addPartner(spinnerFacility, ginnerFacility);
        await facilityTestHelper.addPartner(spinnerFacility, millFacility);
        await facilityTestHelper.addPartner(millFacility, spinnerFacility);

        await facilityTestHelper.addPartner(ginnerFacility, transportFacility);
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
                uploadBlobName = body[0].blobName;
            });
    });

    it('Scan Product Code failed', async () => {
        await testHelper.get(`${basePath}/products/000000`).authenticate(spinnerToken).isNotFound();
    });

    describe('Purchase', () => {
        it('Get required seller: Seller is required', async () => {
            return testHelper
                .get(`${basePath}/purchases/required-sellers`)
                .authenticate(spinnerToken)
                .isOk()
                .has(['isSellerRequired'])
                .then(({ body }) => {
                    expect(body).toMatchObject({ isSellerRequired: true });
                });
        });

        it('Get required seller: Seller is not required', async () => {
            return testHelper
                .get(`${basePath}/purchases/required-sellers`)
                .authenticate(ginnerToken)
                .isOk()
                .has(['isSellerRequired'])
                .then(({ body }) => {
                    expect(body).toMatchObject({ isSellerRequired: false });
                });
        });

        it('Purchases product successfully', async () => {
            const product = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(spinnerToken)
                .send({
                    fromFacilityId: ginnerFacility.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    productIds: [product.id],
                    uploadProofs: [{ blobName: uploadBlobName, fileName }]
                })
                .isCreated()
                .then(({ body }) => {
                    expect(body).toHaveProperty('type', TransactionTypeEnum.PURCHASE);
                });
        });

        it('Scan Product Code successfully', async () => {
            const product = await productTestHelper.createProduct({
                createdFacilityId: ginnerFacility.id,
                certifications: [{ fileName: 'fileName', blobName: uploadBlobName }],
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            const admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
            const qrCodeBatch = await qrCodeTestHelper.createQrCodeBatch(admin);
            const qrCode = await qrCodeTestHelper.createQrCode(qrCodeBatch, {
                status: QrCodeStatusEnum.ACTIVE,
                product
            });

            return testHelper
                .get(`${basePath}/purchases/products/${qrCode.code}`)
                .authenticate(spinnerToken)
                .isOk()
                .has([...Object.keys(product), 'isHavingCertification'])
                .then(({ body }) => {
                    expect(body).toMatchObject({ id: product.id });
                });
        });

        it('Scan Product Code failed: Product is purchased.', async () => {
            const product = await productTestHelper.createProduct({
                createdFacilityId: ginnerFacility.id,
                certifications: [{ fileName: 'fileName', blobName: uploadBlobName }],
                productDefinitionId: productDefinition.id,
                isPurchased: true
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            const admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
            const qrCodeBatch = await qrCodeTestHelper.createQrCodeBatch(admin);
            const qrCode = await qrCodeTestHelper.createQrCode(qrCodeBatch, {
                status: QrCodeStatusEnum.ACTIVE,
                product
            });

            return testHelper
                .get(`${basePath}/purchases/products/${qrCode.code}`)
                .authenticate(spinnerToken)
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Product is purchased.');
                });
        });

        it('Purchases product without seller successfully', async () => {
            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(ginnerToken)
                .send({
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadProofs: [{ blobName: uploadBlobName, fileName }],
                    manualAddedData: {
                        productDefinitionId: productDefinition.id,
                        manualAddedProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: 'text'
                                    },
                                    {
                                        id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                                        value: 123
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Kg'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isCreated()
                .then(({ body }) => {
                    expect(body).toHaveProperty('type', TransactionTypeEnum.PURCHASE);
                });
        });

        it('Purchases product without seller failed: Seller is required.', async () => {
            const product = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(spinnerToken)
                .send({
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    productIds: [product.id],
                    uploadProofs: [{ blobName: uploadBlobName, fileName }]
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Seller is required.');
                });
        });

        it('Purchases product failed: User is not allowed to purchase from the partner.', async () => {
            await facilityTestHelper.addPartner(millFacility, ginnerFacility);
            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(millToken)
                .send({
                    fromFacilityId: ginnerFacility.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    productIds: [],
                    uploadProofs: [{ blobName: uploadBlobName, fileName }]
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'User is not allowed to purchase from the partner.');
                });
        });

        it('Purchases product failed: All purchased products must be same type.', async () => {
            const product = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id
            });
            const productDefinition2 = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            const product2 = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition2.id
            });

            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(spinnerToken)
                .send({
                    fromFacilityId: ginnerFacility.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    productIds: [product.id, product2.id],
                    uploadProofs: [{ blobName: uploadBlobName, fileName }]
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'All purchased products must be same type.');
                });
        });

        it('Purchases product failed: User is not allowed to purchase the products.', async () => {
            const productDefinition2 = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            const product2 = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition2.id
            });

            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(spinnerToken)
                .send({
                    fromFacilityId: ginnerFacility.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    productIds: [product2.id],
                    uploadProofs: [{ blobName: uploadBlobName, fileName }]
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'User is not allowed to purchase the products.');
                });
        });

        it('Purchases product failed: Product is sold to another facility', async () => {
            const product = await productTestHelper.createProduct({
                createdFacilityId: ginnerFacility.id,
                certifications: [{ fileName: 'fileName', blobName: uploadBlobName }],
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            const spinner2 = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
            const spinnerFacility2 = await facilityTestHelper.create(spinner2, UserRoleEnum.SPINNER);

            await facilityTestHelper.addPartner(ginnerFacility, spinnerFacility2);

            await testHelper
                .post(`${basePath}/sells`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product.id],
                    toFacilityId: spinnerFacility2.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    invoiceNumber: faker.random.alphaNumeric(10),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadInvoices: [{ blobName: uploadBlobName, fileName }],
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })

                .isCreated();

            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(spinnerToken)
                .send({
                    fromFacilityId: ginnerFacility.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    productIds: [product.id],
                    uploadProofs: [{ blobName: uploadBlobName, fileName }]
                })
                .isBadRequestError();
        });

        it('Purchases product failed: The value exceeds maximum value.', async () => {
            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(ginnerToken)
                .send({
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadProofs: [{ blobName: uploadBlobName, fileName }],
                    manualAddedData: {
                        productDefinitionId: productDefinition.id,
                        manualAddedProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                                        value: 1111111111111
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 1111111111111,
                                        quantityUnit: 'Unit 1'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isValidateError()
                .has(['errors'])
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');

                    const productNumberMessage = _.get(
                        body,
                        'errors["manuallyAddedData.manualAddedProducts[0].attributes[1]"].messages[0]'
                    );
                    assert.strictEqual(productNumberMessage, 'The value exceeds maximum value.');
                    const productQuantityMessage = _.get(
                        body,
                        'errors["manuallyAddedData.manualAddedProducts[0].attributes[2]"].messages[0]'
                    );
                    assert.strictEqual(productQuantityMessage, 'The value exceeds maximum value.');
                });
        });

        it('Purchases product successfully: Product is sold to the same spinner', async () => {
            const product = await productTestHelper.createProduct({
                createdFacilityId: ginnerFacility.id,
                certifications: [{ fileName: 'fileName', blobName: uploadBlobName }],
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            await testHelper
                .post(`${basePath}/sells`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product.id],
                    toFacilityId: spinnerFacility.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    invoiceNumber: faker.random.alphaNumeric(10),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadInvoices: [{ blobName: uploadBlobName, fileName }],
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })
                .isCreated();

            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(spinnerToken)
                .send({
                    fromFacilityId: ginnerFacility.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    productIds: [product.id],
                    uploadProofs: [{ blobName: uploadBlobName, fileName }]
                })
                .isCreated();
        });

        it('Purchases manual product failed: Missing required attributes', async () => {
            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(ginnerToken)
                .send({
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadProofs: [{ blobName: uploadBlobName, fileName }],
                    manualAddedData: {
                        productDefinitionId: productDefinition.id,
                        manualAddedProducts: [{ attributes: [] }]
                    }
                })
                .isValidateError()
                .has(['errors'])
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');

                    const productIdMessage = _.get(
                        body,
                        'errors["manuallyAddedData.manualAddedProducts[0].ProductID"].messages[0]'
                    );
                    assert.strictEqual(productIdMessage, 'ProductID is required.');
                    const productQuantityMessage = _.get(
                        body,
                        'errors["manuallyAddedData.manualAddedProducts[0].ProductQuantity"].messages[0]'
                    );
                    assert.strictEqual(productQuantityMessage, 'ProductQuantity is required.');
                });
        });

        it('Purchases manual product failed: Invalid attribute type', async () => {
            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(ginnerToken)
                .send({
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadProofs: [{ blobName: uploadBlobName, fileName }],
                    manualAddedData: {
                        productDefinitionId: productDefinition.id,
                        manualAddedProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: 123
                                    },
                                    {
                                        id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                                        value: ''
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: '',
                                        quantityUnit: 'Unit 1'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isValidateError()
                .has(['errors'])
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');

                    const error0 = _.get(
                        body,
                        `errors["manuallyAddedData.manualAddedProducts[0].attributes[0]"].messages[0]`
                    );
                    assert.strictEqual(error0, `ProductID's type must be ${FieldCategoryEnum.TEXT}.`);

                    const error1 = _.get(
                        body,
                        `errors["manuallyAddedData.manualAddedProducts[0].attributes[1]"].messages[0]`
                    );
                    assert.strictEqual(error1, `NumberAttribute's type must be ${FieldCategoryEnum.NUMBER}.`);

                    const error2 = _.get(
                        body,
                        `errors["manuallyAddedData.manualAddedProducts[0].attributes[2]"].messages[0]`
                    );
                    assert.strictEqual(error2, `ProductQuantity's type must be ${FieldCategoryEnum.NUMBER_UNIT_PAIR}.`);
                });
        });

        it('Purchases manual product failed: The code has already been taken.', async () => {
            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(ginnerToken)
                .send({
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadProofs: [{ blobName: uploadBlobName, fileName }],
                    manualAddedData: {
                        productDefinitionId: productDefinition.id,
                        manualAddedProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: 'text'
                                    },
                                    {
                                        id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                                        value: 123
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Unit 1'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isBadRequestError()
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'The Product ID has already been taken.');
                });
        });

        it(`Purchases manual product failed: PercentageAttribute's value must be from 0 to 100.`, async () => {
            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(ginnerToken)
                .send({
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadProofs: [{ blobName: uploadBlobName, fileName }],
                    manualAddedData: {
                        productDefinitionId: productDefinition.id,
                        manualAddedProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                                        value: 123
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Unit 1'
                                    },
                                    {
                                        id: '32ee8d26-a316-4c80-a2e7-6d32e9db6bba',
                                        value: 123
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isValidateError()
                .has(['errors'])
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');

                    const message = _.get(
                        body,
                        `errors["manuallyAddedData.manualAddedProducts[0].attributes[3]"].messages[0]`
                    );

                    assert.strictEqual(message, `PercentageAttribute's value must be from 0 to 100.`);
                });
        });

        it(`Purchases manual product failed: ListAttribute's value is invalid. Proper values must be in (Option1,Option2).`, async () => {
            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(ginnerToken)
                .send({
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadProofs: [{ blobName: uploadBlobName, fileName }],
                    manualAddedData: {
                        productDefinitionId: productDefinition.id,
                        manualAddedProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                                        value: 123
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Unit 1'
                                    },
                                    {
                                        id: '8bbe47d2-1051-4e16-926b-3b4376f7db4e',
                                        value: 123
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isValidateError()
                .has(['errors'])
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');
                    const message = _.get(
                        body,
                        `errors["manuallyAddedData.manualAddedProducts[0].attributes[3]"].messages[0]`
                    );
                    assert.strictEqual(
                        message,
                        `ListAttribute's value is invalid. Proper values must be in (Option1,Option2).`
                    );
                });
        });

        it('Purchases manual product failed: Invalid Number Unit Pair', async () => {
            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(ginnerToken)
                .send({
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadProofs: [{ blobName: uploadBlobName, fileName }],
                    manualAddedData: {
                        productDefinitionId: productDefinition.id,
                        manualAddedProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                                        value: 123
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Unit 0'
                                    },
                                    {
                                        id: '8bbe47d2-1051-4e16-926b-3b4376f7db4e',
                                        value: 123
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isValidateError()
                .has(['errors'])
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');

                    const message = _.get(
                        body,
                        `errors["manuallyAddedData.manualAddedProducts[0].attributes[2]"].messages[0]`
                    );

                    assert.strictEqual(message, `ProductQuantity's unit must be in (Unit 1,Unit 2,Kg).`);
                });
        });

        it('Purchases manual product failed: CountryProvinceDistrictAttribute.countryId must be UUID.', async () => {
            return testHelper
                .post(`${basePath}/purchases`)
                .authenticate(ginnerToken)
                .send({
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    purchaseOrderNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadProofs: [{ blobName: uploadBlobName, fileName }],
                    manualAddedData: {
                        productDefinitionId: productDefinition.id,
                        manualAddedProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                                        value: 123
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Unit 1'
                                    },
                                    {
                                        id: '7aedc9e1-b881-4cdc-a672-3c98b260dc7c',
                                        value: {
                                            countryId: '',
                                            provinceId: '',
                                            districtId: ''
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isValidateError()
                .has(['errors'])
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');

                    const message = _.get(
                        body,
                        `errors["manuallyAddedData.manualAddedProducts[0].attributes[3].CountryProvinceDistrictAttribute.countryId"].messages[0]`
                    );

                    assert.strictEqual(message, `CountryProvinceDistrictAttribute.countryId must be UUID.`);
                });
        });
    });

    describe('Sell', () => {
        it('Sells successfully', async () => {
            const product = await productTestHelper.createProduct({
                createdFacilityId: ginnerFacility.id,
                certifications: [{ fileName: 'fileName', blobName: uploadBlobName }],
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            return testHelper
                .post(`${basePath}/sells`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product.id],
                    toFacilityId: spinnerFacility.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    invoiceNumber: faker.random.alphaNumeric(10),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadInvoices: [{ blobName: uploadBlobName, fileName }],
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })
                .isCreated()
                .then(({ body }) => {
                    expect(body).toHaveProperty('id');
                    expect(body).toHaveProperty('type', TransactionTypeEnum.SELL);
                });
        });

        it('Sells failed: Same product can`t be sold to multiple', async () => {
            const product = await productTestHelper.createProduct({
                createdFacilityId: ginnerFacility.id,
                certifications: [{ fileName: 'fileName', blobName: uploadBlobName }],
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            await testHelper
                .post(`${basePath}/sells`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product.id],
                    toFacilityId: spinnerFacility.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    invoiceNumber: faker.random.alphaNumeric(10),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadInvoices: [{ blobName: uploadBlobName, fileName }],
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })
                .isCreated()
                .then(({ body }) => {
                    expect(body).toHaveProperty('id');
                    expect(body).toHaveProperty('type', TransactionTypeEnum.SELL);
                });

            return testHelper
                .post(`${basePath}/sells`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product.id],
                    toFacilityId: spinnerFacility.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    invoiceNumber: faker.random.alphaNumeric(10),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadInvoices: [{ blobName: uploadBlobName, fileName }],
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })
                .isValidateError()
                .has(['errors.productIds'])
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');
                    assert.strictEqual(body.errors.productIds.messages[0], 'Product is invalid or sold.');
                });
        });

        it('Sells failed: All sold products must be same type.', async () => {
            const product = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id
            });
            const productDefinition2 = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            const product2 = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition2.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);
            await facilityTestHelper.createFacilityItem(ginnerFacility, product2);

            return testHelper
                .post(`${basePath}/sells`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product.id, product2.id],
                    toFacilityId: spinnerFacility.id,
                    price: 1200,
                    currency: CurrencyEnum.USD,
                    invoiceNumber: faker.random.alphaNumeric(10),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadInvoices: [{ blobName: uploadBlobName, fileName }],
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'All sold products must be same type.');
                });
        });

        it('Sells failed: User is not allowed to sell to the partner.', async () => {
            await facilityTestHelper.addPartner(ginnerFacility, millFacility);
            return testHelper
                .post(`${basePath}/sells`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [],
                    toFacilityId: millFacility.id,
                    price: 1200,
                    currency: CurrencyEnum.USD,
                    invoiceNumber: faker.random.alphaNumeric(10),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadInvoices: [{ blobName: uploadBlobName, fileName }],
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'User is not allowed to sell to the partner.');
                });
        });

        it('Sells failed: User is not allowed to sell the products.', async () => {
            const productDefinition2 = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            const product2 = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition2.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product2);

            return testHelper
                .post(`${basePath}/sells`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product2.id],
                    toFacilityId: spinnerFacility.id,
                    price: 1200,
                    currency: CurrencyEnum.USD,
                    invoiceNumber: faker.random.alphaNumeric(10),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadInvoices: [{ blobName: uploadBlobName, fileName }],
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'User is not allowed to sell the products.');
                });
        });

        it('Sells fail because not upload invoices', async () => {
            const product = await productTestHelper.createProduct({
                createdFacilityId: ginnerFacility.id,
                certifications: [{ fileName: 'fileName', blobName: uploadBlobName }],
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            return testHelper
                .post(`${basePath}/sells`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product.id],
                    toFacilityId: spinnerFacility.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    invoiceNumber: faker.random.alphaNumeric(10),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })
                .isValidateError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');

                    assert.strictEqual(body.errors.uploadInvoices.messages[0], 'Upload Invoices must be an array');
                });
        });

        it('Sells failed', async () => {
            const product = await productTestHelper.createProduct({
                createdFacilityId: ginnerFacility.id,
                certifications: [{ fileName: 'fileName', blobName: uploadBlobName }],
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            const spinner2 = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
            const spinnerFacility2 = await facilityTestHelper.create(spinner2, UserRoleEnum.SPINNER);

            return testHelper
                .post(`${basePath}/sells`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product.id],
                    toFacilityId: spinnerFacility2.id,
                    price: 1000,
                    currency: CurrencyEnum.USD,
                    invoiceNumber: faker.random.alphaNumeric(10),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadInvoices: [{ blobName: uploadBlobName, fileName }],
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })
                .isNotFound()
                .then((body) => {
                    assert.strictEqual(body.body.message, 'Facility not found');
                });
        });
    });

    describe('Transport', () => {
        it('Transport product successfully', async () => {
            const product = await productTestHelper.createProduct({
                createdFacilityId: ginnerFacility.id,
                certifications: [{ fileName: 'fileName', blobName: uploadBlobName }],
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            return testHelper
                .post(`${basePath}/transports`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product.id],
                    toFacilityId: transportFacility.id,
                    totalWeight: 999,
                    weightUnit: faker.random.objectElement(TP_MAIN_WEIGHT_UNITS),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })
                .isCreated()
                .then(({ body }) => {
                    expect(body).toHaveProperty('type', TransactionTypeEnum.TRANSPORT);
                });
        });

        it('Transport product fail because not upload uploadPackingLists', async () => {
            const product = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            return testHelper
                .post(`${basePath}/transports`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product.id],
                    toFacilityId: transportFacility.id,
                    totalWeight: 999,
                    weightUnit: faker.random.objectElement(TP_MAIN_WEIGHT_UNITS),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix()
                })
                .isValidateError();
        });

        it('Transport product fail because wrong toFacilityId', async () => {
            const product = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(ginnerFacility, product);

            return testHelper
                .post(`${basePath}/transports`)
                .authenticate(ginnerToken)
                .send({
                    productIds: [product.id],
                    toFacilityId: wrongId,
                    totalWeight: 999,
                    weightUnit: faker.random.objectElement(TP_MAIN_WEIGHT_UNITS),
                    packingListNumber: faker.random.alphaNumeric(10),
                    transactedAt: moment().unix(),
                    uploadPackingLists: [{ blobName: uploadBlobName, fileName }]
                })
                .isValidateError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');
                });
        });
    });

    describe('Assign product', () => {
        it('Scan Product Code successfully', async () => {
            const product = await productTestHelper.createProduct({
                createdFacilityId: ginnerFacility.id,
                certifications: [{ fileName: 'fileName', blobName: uploadBlobName }],
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(spinnerFacility, product);

            const admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
            const qrCodeBatch = await qrCodeTestHelper.createQrCodeBatch(admin);
            const qrCode = await qrCodeTestHelper.createQrCode(qrCodeBatch, {
                status: QrCodeStatusEnum.ACTIVE,
                product
            });

            return testHelper
                .get(`${basePath}/assign-products/products/${qrCode.code}`)
                .authenticate(spinnerToken)
                .isOk()
                .then(({ body }) => {
                    expect(body).toMatchObject({ id: product.id });
                });
        });

        it('Scan Product Code failed: Do not allow to add same product ID as input product multiple times.', async () => {
            const product = await productTestHelper.createProduct({
                createdFacilityId: ginnerFacility.id,
                certifications: [{ fileName: 'fileName', blobName: uploadBlobName }],
                productDefinitionId: productDefinition.id,
                isTransformed: true
            });
            await facilityTestHelper.createFacilityItem(spinnerFacility, product);

            const admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
            const qrCodeBatch = await qrCodeTestHelper.createQrCodeBatch(admin);
            const qrCode = await qrCodeTestHelper.createQrCode(qrCodeBatch, {
                status: QrCodeStatusEnum.ACTIVE,
                product
            });

            return testHelper
                .get(`${basePath}/assign-products/products/${qrCode.code}`)
                .authenticate(spinnerToken)
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(
                        body.message,
                        'Do not allow to add same product ID as input product multiple times.'
                    );
                });
        });

        it('Assigns product ID failed: Invalid Product ID', async () => {
            const product = await productTestHelper.createProduct({
                code: faker.random.words(5),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id,
                isTransformed: true
            });

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [product.id],
                    outputProduct: {}
                })
                .isValidateError()
                .has(['errors.inputProductIds'])
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');
                    assert.strictEqual(body.errors.inputProductIds.messages[0], 'Product is invalid or assigned.');
                });
        });

        it('Assigns product ID failed: Not found product of facility', async () => {
            const product = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id
            });

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [product.id],
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                attributes: []
                            }
                        ]
                    }
                })
                .isNotFound()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Product ID is invalid');
                });
        });

        it('Assigns product ID failed: All input products must be same type.', async () => {
            const product = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id
            });
            const productDefinition2 = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            const product2 = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition2.id
            });
            await facilityTestHelper.createFacilityItem(spinnerFacility, product);
            await facilityTestHelper.createFacilityItem(spinnerFacility, product2);

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [product.id, product2.id],
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                attributes: []
                            }
                        ]
                    }
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'All input products must be same type.');
                });
        });

        it('Assigns product ID failed: Input product list - User is not allowed to assign the products.', async () => {
            const productDefinition2 = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            const product2 = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition2.id
            });
            await facilityTestHelper.createFacilityItem(spinnerFacility, product2);

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [product2.id],
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                attributes: []
                            }
                        ]
                    }
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'User is not allowed to assign the products.');
                });
        });

        it('Assigns product ID failed: Output product list - User is not allowed to assign the products.', async () => {
            const inputProduct = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id
            });
            const productDefinition2 = await productTestHelper.createProductDefinition({
                name: faker.name.title()
            });
            await facilityTestHelper.createFacilityItem(spinnerFacility, inputProduct);

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [inputProduct.id],
                    outputProduct: {
                        productDefinitionId: productDefinition2.id,
                        outputProducts: [
                            {
                                attributes: []
                            }
                        ]
                    }
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'User is not allowed to assign the products.');
                });
        });

        it('Assigns product ID failed: The code has already been taken.', async () => {
            const code = faker.random.alphaNumeric(10);
            const inputProduct = await productTestHelper.createProduct({
                code,
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(spinnerFacility, inputProduct);

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [inputProduct.id],
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: code
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Unit 1'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isBadRequestError()
                .has(['errors'])
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'The Product ID has already been taken.');
                });
        });

        it('Assigns product ID failed: Missing required attributes.', async () => {
            const inputProduct = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id,
                quantity: 123,
                quantityUnit: 'Unit 1'
            });
            await facilityTestHelper.createFacilityItem(spinnerFacility, inputProduct);

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [inputProduct.id],
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                attributes: [
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Unit 1'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isValidateError()
                .has(['errors'])
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');

                    const productIdMessage = _.get(
                        body,
                        'errors["manuallyAddedData.manualAddedProducts[0].ProductID"].messages[0]'
                    );
                    assert.strictEqual(productIdMessage, 'ProductID is required.');
                });
        });

        it('Assigns product ID failed: Total weight of output products can not be greater than total weight of input products.', async () => {
            const inputProduct = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id
            });
            await facilityTestHelper.createFacilityItem(spinnerFacility, inputProduct);

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [inputProduct.id],
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Kg'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(
                        body.message,
                        'Total weight of output products can not be greater than total weight of input products.'
                    );
                });
        });

        it('Assigns product ID without input products failed: Insufficient stock in hand. Please register all purchases.', async () => {
            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(ginnerToken)
                .send({
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                                        value: 123
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 999,
                                        quantityUnit: 'Kg'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isBadRequestError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Insufficient stock in hand. Please register all purchases.');
                });
        });

        it('Assigns product ID without input products successfully', async () => {
            let qrCode: string;
            const admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
            await testHelper
                .post('/qr-code-batchs')
                .authenticate(await userTestHelper.getToken(admin))
                .send({ name: faker.random.words(3), quantity: faker.datatype.number({ min: 5, max: 15 }) })
                .isCreated()
                .then(async ({ body }) => {
                    qrCode = await getQrCode(body);
                });

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(ginnerToken)
                .send({
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                qrCode,
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                                        value: 123
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 1,
                                        quantityUnit: 'Kg'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isCreated();
        });

        it('Assigns product ID failed: Product is assigned.', async () => {
            const inputProduct = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id,
                quantity: 123,
                quantityUnit: 'Kg'
            });
            await facilityTestHelper.createFacilityItem(spinnerFacility, inputProduct);

            await testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [inputProduct.id],
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Kg'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isCreated();

            return await testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [inputProduct.id],
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Kg'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isValidateError()
                .has(['errors.inputProductIds'])
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');
                    assert.strictEqual(body.errors.inputProductIds.messages[0], 'Product is invalid or assigned.');
                });
        });

        it('Assigns product ID failed: Assign QR Code without permission ASSIGN_QR_CODE', async () => {
            let qrCode: string;
            const admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
            await testHelper
                .post('/qr-code-batchs')
                .authenticate(await userTestHelper.getToken(admin))
                .send({ name: faker.random.words(3), quantity: faker.datatype.number({ min: 5, max: 15 }) })
                .isCreated()
                .then(async ({ body }) => {
                    qrCode = await getQrCode(body);
                });

            const inputProduct = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id,
                quantity: 123,
                quantityUnit: 'Kg'
            });
            await facilityTestHelper.createFacilityItem(spinnerFacility, inputProduct);

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [inputProduct.id],
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                qrCode,
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Kg'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isForbiddenError();
        });

        it('Assigns product ID failed: Input DNA Identifier without permission ASSIGN_DNA', async () => {
            const inputProduct = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id,
                quantity: 123,
                quantityUnit: 'Kg'
            });

            const permissionLogPurchase = await PermissionRepository.make().findOneBy({
                action: PermissionEnum.LOG_TRANSFORMATIONS
            });
            const role = await rolePermissionTestHelper.createRole({}, [permissionLogPurchase.id]);
            const user = await userTestHelper.createUser({}, role.name);
            const userFacility = await facilityTestHelper.create(user, role.name);
            const userToken = await userTestHelper.getToken(user);

            await facilityTestHelper.createFacilityItem(userFacility, inputProduct);
            await supplyChainTestHelper.createSupplyChainNode({
                fromRoleId: ginner.roleId,
                roleId: role.id,
                outputProductDefinitionId: productDefinition.id
            });

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(userToken)
                .send({
                    inputProductIds: [inputProduct.id],
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                dnaIdentifier: faker.random.alphaNumeric(10),
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Kg'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isForbiddenError();
        });

        it('Assigns product ID failed: Qr code must be a number with 9 digits', async () => {
            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(ginnerToken)
                .send({
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                qrCode: 'aaa',
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '099be31f-9e01-44fa-ae6b-d34c74a8aa3e',
                                        value: 123
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 1,
                                        quantityUnit: 'Kg'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isValidateError()
                .has(['errors'])
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');

                    const message = _.get(
                        body,
                        'errors.outputProduct.children.outputProducts.children[0].children.qrCode.messages[0]'
                    );
                    assert.strictEqual(message, 'Qr code must be a number with 9 digits');
                });
        });

        it('Assigns product ID successfully', async () => {
            const inputProduct = await productTestHelper.createProduct({
                code: faker.random.alphaNumeric(10),
                createdFacilityId: ginnerFacility.id,
                productDefinitionId: productDefinition.id,
                quantity: 123,
                quantityUnit: 'Kg'
            });
            await facilityTestHelper.createFacilityItem(spinnerFacility, inputProduct);

            return testHelper
                .post(`${basePath}/assign-products`)
                .authenticate(spinnerToken)
                .send({
                    inputProductIds: [inputProduct.id],
                    outputProduct: {
                        productDefinitionId: productDefinition.id,
                        outputProducts: [
                            {
                                attributes: [
                                    {
                                        id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                                        value: faker.random.alphaNumeric(10)
                                    },
                                    {
                                        id: '36d50125-22fe-41dd-92c0-2e7122aa65df',
                                        value: 123,
                                        quantityUnit: 'Kg'
                                    }
                                ]
                            }
                        ]
                    }
                })
                .isCreated();
        });
    });
});
