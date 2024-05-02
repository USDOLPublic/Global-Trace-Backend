import faker from 'faker';
import { readFileSync } from 'fs';
import moment from 'moment';
import path from 'path';
import { env } from '~config/env.config';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { EventTypeEnum } from '~history/enums/event-type.enum';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransformationEntity } from '~events/entities/transformation.entity';
import { CurrencyEnum } from '~events/enums/currency.enum';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { AttributeEntity } from '~product-definitions/entities/attribute.entity';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { AttributeRepository } from '~product-definitions/repositories/attribute.repository';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { QrCodeEntity } from '~qr-codes/entities/qr-code.entity';
import { QrCodeRepository } from '~qr-codes/repositories/qr-code.repository';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { PermissionRepository } from '~role-permissions/repositories/permission.repository';
import { RolePermissionTestHelper } from '~role-permissions/tests/role-permission-test.helper';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';
import { RoleRepository } from '~role-permissions/repositories/role.repository';

describe('HistoryController (e2e)', () => {
    const testHelper = new TestHelper();
    const userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    const facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    const productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);
    const supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
    const rolePermissionTestHelper = testHelper.getTestHelperModule(RolePermissionTestHelper);

    let ginner: UserEntity;
    let ginnerFacility: FacilityEntity;
    let spinner: UserEntity;
    let spinnerFacility: FacilityEntity;
    let spinnerToken: string;
    let mill: UserEntity;
    let millFacility: FacilityEntity;
    let millToken: string;
    let uploadBlobName: string;
    let inputProductDefinition: ProductDefinitionEntity;
    let outputProductDefinition: ProductDefinitionEntity;

    async function getQrCodeValue(body: QrCodeEntity) {
        const qrCodeBatchId = body.id;
        const qrCode = await QrCodeRepository.make().findOneByOrFail({ qrCodeBatchId });
        return qrCode.code;
    }

    beforeAll(async () => {
        await testHelper.initialize();

        ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER, {
            chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
            reconciliationStartAt: moment().subtract(1, 'day').unix(),
            reconciliationDuration: '12 months'
        });

        spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);
        spinnerToken = await userTestHelper.getToken(spinner);

        mill = await userTestHelper.createUser({}, UserRoleEnum.MILL);
        millFacility = await facilityTestHelper.create(mill, UserRoleEnum.MILL);
        millToken = await userTestHelper.getToken(mill);

        await facilityTestHelper.addPartner(spinnerFacility, millFacility);
        await facilityTestHelper.addPartner(millFacility, spinnerFacility);

        await facilityTestHelper.addPartner(spinnerFacility, ginnerFacility);

        const attributes: Partial<AttributeEntity>[] = [
            {
                id: 'ad320d8e-12e9-4fe5-b5c9-04d63f6ac00f',
                name: 'ProductID',
                type: FieldTypeEnum.PRODUCT_ID,
                category: FieldCategoryEnum.TEXT,
                nameTranslation: { en: 'Attribute ID' }
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
            }
        ];

        await AttributeRepository.make().save(attributes);

        inputProductDefinition = await productTestHelper.createProductDefinition({
            name: faker.name.title()
        });
        outputProductDefinition = await productTestHelper.createProductDefinition(
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
                    order: 1
                }
            ]
        );

        const farmRole = await RoleRepository.make().findOneBy({ name: UserRoleEnum.FARM });

        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: null,
            roleId: farmRole.id,
            outputProductDefinitionId: inputProductDefinition.id
        });
        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: farmRole.id,
            roleId: ginner.roleId,
            outputProductDefinitionId: inputProductDefinition.id
        });
        await supplyChainTestHelper.createSupplyChainNode({
            fromRoleId: ginner.roleId,
            roleId: spinner.roleId,
            outputProductDefinitionId: outputProductDefinition.id
        });
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Upload proof successfully', () => {
        return testHelper
            .post('/upload/files')
            .authenticate(millToken)
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

    it('Gets transaction history', async () => {
        const product = await productTestHelper.createProduct({
            code: faker.random.alphaNumeric(10),
            createdFacilityId: ginnerFacility.id,
            productDefinitionId: inputProductDefinition.id
        });

        await facilityTestHelper.createFacilityItem(ginnerFacility, product);

        await testHelper
            .post(`/events/purchases`)
            .authenticate(spinnerToken)
            .send({
                fromFacilityId: ginnerFacility.id,
                price: 1000,
                currency: CurrencyEnum.USD,
                purchaseOrderNumber: faker.random.alphaNumeric(10),
                transactedAt: moment().unix(),
                productIds: [product.id],
                uploadProofs: [{ blobName: uploadBlobName, fileName: 'fileName' }]
            })
            .isCreated()
            .then(({ body }) => {
                expect(body).toHaveProperty('type', TransactionTypeEnum.PURCHASE);
            });

        let transformationId: string;
        await testHelper
            .post(`/events/assign-products`)
            .authenticate(spinnerToken)
            .send({
                inputProductIds: [product.id],
                outputProduct: {
                    productDefinitionId: outputProductDefinition.id,
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
                                    quantityUnit: 'Unit 1'
                                }
                            ]
                        }
                    ]
                }
            })
            .isCreated()
            .then(({ body }) => {
                expect(body).toHaveProperty('id');
                transformationId = body.id;
            });

        return testHelper
            .get('/histories')
            .authenticate(spinnerToken)
            .isOk()
            .isPagination()
            .then(({ body }) => {
                const purchaseTransaction = body.items.find(({ entityType }) => entityType === TransactionEntity.name);
                expect(purchaseTransaction).toMatchObject({
                    entityType: TransactionEntity.name,
                    facilityId: spinnerFacility.id,
                    type: EventTypeEnum.PURCHASE
                });
                expect(Object.keys(purchaseTransaction.transaction)).toEqual(
                    expect.arrayContaining([
                        'totalWeight',
                        'id',
                        'createdAt',
                        'updatedAt',
                        'fromFacilityId',
                        'toFacilityId',
                        'facilityId',
                        'price',
                        'weightUnit',
                        'purchaseOrderNumber',
                        'transactionItems'
                    ])
                );

                const transformation = body.items.find(({ entityType }) => entityType === TransformationEntity.name);
                expect(transformation).toMatchObject({
                    entityId: transformationId,
                    entityType: TransformationEntity.name,
                    facilityId: spinnerFacility.id,
                    type: EventTypeEnum.TRANSFORM
                });
                expect(Object.keys(transformation.transformation)).toEqual(
                    expect.arrayContaining(['id', 'transformationItems', 'facilityId', 'uploadCertifications'])
                );
            });
    });

    it('Assign existing Product ID, will not add event history', async () => {
        const code = faker.random.alphaNumeric(10);
        const inputProduct = await productTestHelper.createProduct({
            code,
            createdFacilityId: ginnerFacility.id,
            productDefinitionId: inputProductDefinition.id
        });
        await facilityTestHelper.createFacilityItem(spinnerFacility, inputProduct);

        await testHelper
            .post(`/events/assign-products`)
            .authenticate(spinnerToken)
            .send({
                inputProductIds: [inputProduct.id],
                outputProduct: {
                    productDefinitionId: outputProductDefinition.id,
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
            .isBadRequestError();

        return testHelper
            .get('/histories')
            .authenticate(spinnerToken)
            .isOk()
            .isPagination()
            .then(({ body }) => {
                expect(body.items).toHaveLength(2);
                const transformation = body.items.find(({ entityType }) => entityType === TransformationEntity.name);
                expect(transformation).toMatchObject({
                    entityType: TransformationEntity.name,
                    facilityId: spinnerFacility.id,
                    type: EventTypeEnum.TRANSFORM
                });
                expect(Object.keys(transformation.transformation)).toEqual(
                    expect.arrayContaining(['id', 'transformationItems', 'facilityId', 'uploadCertifications'])
                );
            });
    });

    it('Gets history transaction history have QRcode', async () => {
        const admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        let qrCode: string;
        const response = await testHelper
            .post('/qr-code-batchs')
            .authenticate(await userTestHelper.getToken(admin))
            .send({ name: faker.random.words(3), quantity: faker.datatype.number({ min: 5, max: 15 }) })
            .isCreated()
            .then(({ body }) => body);

        qrCode = await getQrCodeValue(response);

        const inputProduct = await productTestHelper.createProduct({
            code: faker.random.alphaNumeric(10),
            createdFacilityId: ginnerFacility.id,
            productDefinitionId: inputProductDefinition.id
        });
        await facilityTestHelper.createFacilityItem(spinnerFacility, inputProduct);

        const permission = await PermissionRepository.make().findOne({
            where: {
                action: PermissionEnum.ASSIGN_QR_CODE
            }
        });

        await rolePermissionTestHelper.assignPermissions(spinner.roleId, [permission.id]);

        await testHelper
            .post(`/events/assign-products`)
            .authenticate(spinnerToken)
            .send({
                inputProductIds: [inputProduct.id],
                outputProduct: {
                    productDefinitionId: outputProductDefinition.id,
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
                                    quantityUnit: 'Unit 1'
                                }
                            ]
                        }
                    ]
                }
            })
            .isCreated();

        return testHelper
            .get('/histories')
            .authenticate(spinnerToken)
            .isOk()
            .isPagination()
            .then(({ body }) => {
                expect(body.items).toHaveLength(3);
                const transformation = body.items.find(({ entityType }) => entityType === TransformationEntity.name);
                expect(transformation).toMatchObject({
                    entityType: TransformationEntity.name,
                    facilityId: spinnerFacility.id,
                    type: EventTypeEnum.TRANSFORM
                });
                expect(Object.keys(transformation.transformation)).toEqual(
                    expect.arrayContaining(['id', 'transformationItems', 'facilityId', 'uploadCertifications'])
                );
            });
    });

    it('Gets history transaction history by TransactionType', async () => {
        return testHelper
            .get('/histories?types=1')
            .authenticate(spinnerToken)
            .isOk()
            .isPagination()
            .then(({ body }) => {
                expect(body.items).toHaveLength(1);
                const purchaseTransaction = body.items.find(({ entityType }) => entityType === TransactionEntity.name);
                expect(purchaseTransaction).toMatchObject({
                    entityType: TransactionEntity.name,
                    facilityId: spinnerFacility.id,
                    type: EventTypeEnum.PURCHASE
                });
                expect(Object.keys(purchaseTransaction.transaction)).toEqual(
                    expect.arrayContaining([
                        'totalWeight',
                        'id',
                        'createdAt',
                        'updatedAt',
                        'fromFacilityId',
                        'toFacilityId',
                        'facilityId',
                        'price',
                        'weightUnit',
                        'purchaseOrderNumber',
                        'transactionItems'
                    ])
                );
            });
    });

    it('Get season start time successfully', async () => {
        return testHelper
            .get('/histories/season-start-time')
            .authenticate(spinnerToken)
            .isOk()
            .then(({ body }) => {
                expect(body).toHaveProperty('seasonStartTime');
                expect(body).toHaveProperty('seasonDuration');
            });
    });
});
