import fs from 'fs';
import path from 'path';
import { env } from '~config/env.config';
import { TestHelper } from '~core/tests/test.helper';
import { ProductTranslationValidationType } from '~product-definitions/types/product-translation-validation-error.type';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('ProductTranslationController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let superAdmin: UserEntity;
    let superAdminToken: string;

    beforeAll(async () => {
        await testHelper.initialize();
        superAdmin = await userTestHelper.createUser({}, UserRoleEnum.SUPER_ADMIN);
        superAdminToken = await userTestHelper.getToken(superAdmin);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Super Admin upload product translation file', () => {
        const baseUrl = '/product-translations/products';

        it('Get product translation file successfully', async () => {
            await getProductTranslationFile(baseUrl, superAdminToken);
        });

        it('Upload file with correct data ', async () => {
            const { body } = await testHelper
                .post(baseUrl)
                .authenticate(superAdminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `product-definitions/tests/assets/product-translate.json`)
                    ),
                    'product-translate.json'
                )
                .isCreated();

            expect(body.validatedItemCount).toEqual(4);
        });

        it('Upload file with bad data', async () => {
            const { body } = await testHelper
                .post(baseUrl)
                .authenticate(superAdminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `product-definitions/tests/assets/bad-product-translate.json`)
                    ),
                    'bad-product-translate.json'
                )
                .isCreated();

            const validationErrors: ProductTranslationValidationType[] = body.validationErrors;
            const error0: ProductTranslationValidationType = validationErrors.find(
                (error: ProductTranslationValidationType) => error.index === 0
            );
            const error1: ProductTranslationValidationType = validationErrors.find(
                (error: ProductTranslationValidationType) => error.index === 1
            );
            const error2: ProductTranslationValidationType = validationErrors.find(
                (error: ProductTranslationValidationType) => error.index === 2
            );
            const error3: ProductTranslationValidationType = validationErrors.find(
                (error: ProductTranslationValidationType) => error.index === 3
            );
            const error4: ProductTranslationValidationType = validationErrors.find(
                (error: ProductTranslationValidationType) => error.index === 4
            );

            expect(error0.errors[0].error).toEqual('id is required');
            expect(error1.errors[0].error).toEqual('name is required');
            expect(error1.errors[1].error).toEqual('Invalid id');
            expect(error2.errors[0].error).toEqual('id must be an UUID');
            expect(error2.errors[1].error).toEqual('nameTranslation.123 is not allowed');
            expect(error3.errors[0].error).toEqual('nameTranslation must be of type object');
            expect(error4.errors[0].error).toEqual('nameTranslation.en must be a string');
        });

        it('Upload empty product translate file', async () => {
            await testHelper
                .post(baseUrl)
                .authenticate(superAdminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `product-definitions/tests/assets/empty-product-translate.json`)
                    ),
                    'product-translate.json'
                )
                .isBadRequestError();
        });

        it('Upload product translate file has empty array', async () => {
            await testHelper
                .post(baseUrl)
                .authenticate(superAdminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `product-definitions/tests/assets/product-translate-has-empty-array.json`
                        )
                    ),
                    'product-translate.json'
                )
                .isBadRequestError();
        });
    });

    async function getProductTranslationFile(baseUrl: string, superAdminToken: string) {
        let shortToken: string;
        await testHelper
            .post('/auth/short-token')
            .authenticate(superAdminToken)
            .isCreated()
            .then(({ body }) => {
                expect(body).toHaveProperty('shortToken');
                shortToken = body.shortToken;
            });

        await testHelper.get(`${baseUrl}?shortToken=${shortToken}`).isOk();
    }

    describe('Super Admin upload product attribute translation file', () => {
        const baseUrl = '/product-translations/attributes';

        it('Get product translation file successfully', async () => {
            await getProductTranslationFile(baseUrl, superAdminToken);
        });

        it('Upload file with correct data ', async () => {
            const { body } = await testHelper
                .post(baseUrl)
                .authenticate(superAdminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `product-definitions/tests/assets/product-attribute-translate.json`)
                    ),
                    'product-attribute-translate.json'
                )
                .isCreated();

            expect(body.validatedItemCount).toEqual(3);
        });

        it('Upload file with bad data', async () => {
            const { body } = await testHelper
                .post(baseUrl)
                .authenticate(superAdminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `product-definitions/tests/assets/bad-product-attribute-translate.json`
                        )
                    ),
                    'bad-product-attribute-translate.json'
                )
                .isCreated();

            const validationErrors: ProductTranslationValidationType[] = body.validationErrors;
            const error0: ProductTranslationValidationType = validationErrors.find(
                (error: ProductTranslationValidationType) => error.index === 0
            );
            const error1: ProductTranslationValidationType = validationErrors.find(
                (error: ProductTranslationValidationType) => error.index === 1
            );
            const error2: ProductTranslationValidationType = validationErrors.find(
                (error: ProductTranslationValidationType) => error.index === 2
            );

            expect(error0.errors[0].error).toEqual('id is required');
            expect(error1.errors[0].error).toEqual('name is required');
            expect(error1.errors[1].error).toEqual('Invalid id');
            expect(error2.errors[0].error).toEqual('id must be an UUID');
            expect(error2.errors[1].error).toEqual('nameTranslation.123 is not allowed');
        });

        it('Upload empty product attribute translate file', async () => {
            await testHelper
                .post(baseUrl)
                .authenticate(superAdminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `product-definitions/tests/assets/empty-product-attribute-translate.json`
                        )
                    ),
                    'bad-product-attribute-translate.json'
                )
                .isBadRequestError();
        });

        it('Upload product attribute translate file has empty array', async () => {
            await testHelper
                .post(baseUrl)
                .authenticate(superAdminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `product-definitions/tests/assets/product-attribute-translate-has-empty-array.json`
                        )
                    ),
                    'bad-product-attribute-translate.json'
                )
                .isBadRequestError();
        });
    });
});
