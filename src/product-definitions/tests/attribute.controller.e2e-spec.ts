import faker from 'faker';
import { TestHelper } from '~core/tests/test.helper';
import { AttributeEntity } from '~product-definitions/entities/attribute.entity';
import { ProductDefinitionAttributeEntity } from '~product-definitions/entities/product-definition-attribute.entity';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { AttributeRepository } from '~product-definitions/repositories/attribute.repository';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('AttributeController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let superAdmin: UserEntity;
    let superAdminToken: string;
    let attributeId: string;

    beforeAll(async () => {
        await testHelper.initialize();
        superAdmin = await userTestHelper.createUser({}, UserRoleEnum.SUPER_ADMIN);
        superAdminToken = await userTestHelper.getToken(superAdmin);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Super Admin adds an attribute', () => {
        it('Super Admin adds an attribute successfully', () => {
            const data = {
                name: 'Attribute 1',
                type: FieldTypeEnum.OTHER,
                category: FieldCategoryEnum.LIST,
                options: [{ value: 'Value 1' }]
            };
            return testHelper
                .post('/attributes')
                .authenticate(superAdminToken)
                .send(data)
                .isCreated()
                .then(async ({ body }) => {
                    await testHelper.visibleInDatabase(AttributeEntity, {
                        ...data,
                        nameTranslation: { en: data.name },
                        options: `[{"value": "${data.options[0].value}", "translation": {"en": "${data.options[0].value}"}}]`
                    });
                });
        });

        it('Super Admin adds an attribute failed: validation', () => {
            return testHelper
                .post('/attributes')
                .authenticate(superAdminToken)
                .send({
                    name: 'Attribute 1',
                    category: 'Example'
                })
                .isValidateError();
        });

        it('Super Admin adds an attribute failed with attribute type or attribute category is invalid.', () => {
            return testHelper
                .post('/attributes')
                .authenticate(superAdminToken)
                .send({
                    name: 'Attribute 5',
                    type: FieldTypeEnum.PRODUCT_ID,
                    category: FieldCategoryEnum.NUMBER
                })
                .isBadRequestError();
        });
    });

    describe('Super Admin gets an attribute', () => {
        it('Super Admin gets an attribute successfully', async () => {
            await testHelper
                .post('/attributes')
                .authenticate(superAdminToken)
                .send({
                    name: 'Attribute 2',
                    type: FieldTypeEnum.PRODUCT_ID,
                    category: FieldCategoryEnum.TEXT
                })
                .isCreated()
                .then(({ body }) => {
                    attributeId = body.id;
                });

            return testHelper.get(`/attributes/${attributeId}`).authenticate(superAdminToken).isOk();
        });
    });

    describe('Super Admin gets all attributes', () => {
        it('Super Admin gets all attributes successfully', () => {
            return testHelper.get('/attributes').authenticate(superAdminToken).isOk();
        });
    });

    describe('Super Admin edits an attribute', () => {
        it('Super Admin edits an attribute successfully', () => {
            const editData = {
                name: 'Attribute 2 updated',
                type: FieldTypeEnum.PRODUCT_ID,
                category: FieldCategoryEnum.TEXT
            };
            return testHelper
                .put(`/attributes/${attributeId}`)
                .authenticate(superAdminToken)
                .send(editData)
                .isOk()
                .then(async () => {
                    await testHelper.visibleInDatabase(AttributeEntity, { ...editData, id: attributeId });
                });
        });
    });

    describe('Super Admin delete a role', () => {
        it('Delete an attribute by id successfully', async () => {
            const attribute = await AttributeRepository.make().createOne({
                name: faker.name.title(),
                category: FieldCategoryEnum.TEXT
            });

            await testHelper
                .delete(`/attributes/${attribute.id}`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isNoContent()
                .then(async () => {
                    await testHelper.invisibleInDatabase(AttributeEntity, {
                        id: attribute.id
                    });

                    await testHelper.invisibleInDatabase(ProductDefinitionAttributeEntity, {
                        attributeId: attribute.id
                    });
                });
        });
    });

    describe('Check role guard', () => {
        it('Admin can not access API', async () => {
            const admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
            return testHelper
                .get('/attributes')
                .authenticate(await userTestHelper.getToken(admin))
                .isForbiddenError();
        });
    });
});
