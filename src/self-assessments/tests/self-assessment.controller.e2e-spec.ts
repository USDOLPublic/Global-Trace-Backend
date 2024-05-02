import path from 'path';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RolePermissionTestHelper } from '~role-permissions/tests/role-permission-test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';
import fs from 'fs';
import { env } from '~config/env.config';
import { SelfAssessmentTestHelper } from './self-assessment-test.helper';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import faker from 'faker';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { SelfAssessmentGroupEntity } from '~self-assessments/entities/self-assessment-group.entity';
import { SelfAssessmentQuestionTypesEnum } from '~self-assessments/enums/self-assessment-question-types.enum.';
import { first } from 'lodash';
import { trans } from '@diginexhk/nestjs-cls-translation';
import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';

describe('SelfAssessmentController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    let rolePermissionTestHelper = testHelper.getTestHelperModule(RolePermissionTestHelper);
    let selfAssessmentTestHelper = testHelper.getTestHelperModule(SelfAssessmentTestHelper);
    let supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
    let productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);

    let permission: PermissionEntity;
    let role: RoleEntity;
    let superAdmin: UserEntity;
    let user: UserEntity;

    let userToken: string;
    let superAdminToken: string;

    let createdAnswerAssessment: SelfAssessmentAnswerEntity;
    let firstGroup: SelfAssessmentGroupEntity;
    let firstQuestionResponse: SelfAssessmentQuestionResponseEntity;
    let value: string;

    const getSelfAssessment = async (token: string) => {
        const { body } = await testHelper.get('/self-assessments').authenticate(token).isOk();
        return body.selfAssessment;
    };

    const getAnswerAssessment = async (token: string) => {
        return testHelper.get('/self-assessments/answers').authenticate(token).isOk();
    };

    beforeAll(async () => {
        await testHelper.initialize();
        superAdmin = await userTestHelper.createUser({}, UserRoleEnum.SUPER_ADMIN);
        superAdminToken = await userTestHelper.getToken(superAdmin);

        permission = await rolePermissionTestHelper.createPermission({ action: PermissionEnum.COMPLETE_OWN_SAQ });
        const permissionAdmin = await rolePermissionTestHelper.createPermission({
            action: PermissionEnum.ADMINISTRATOR_COMPLETES_PROFILE
        });
        role = await rolePermissionTestHelper.createRole({ type: RoleTypeEnum.PRODUCT }, [
            permission.id,
            permissionAdmin.id
        ]);
        user = await userTestHelper.createUser({ roleId: role.id });
        userToken = await userTestHelper.getToken(user);
        await facilityTestHelper.create(user, UserRoleEnum.GINNER, { typeId: role.id });

        const productDefinition = await productTestHelper.createProductDefinition({
            name: faker.name.title()
        });

        await supplyChainTestHelper.createSupplyChainNode({
            roleId: role.id,
            fromRoleId: null,
            outputProductDefinitionId: productDefinition.id
        });

        await testHelper
            .post('/self-assessments/import')
            .authenticate(superAdminToken)
            .set('Content-Type', 'multipart/form-data')
            .field('roleId', role.id)
            .attach(
                'fileSaq',
                fs.readFileSync(path.join(env.ROOT_PATH, `self-assessments/tests/assets/1-file-saq.xlsx`)),
                '1-file-saq.xlsx'
            )
            .attach(
                'fileFacilityGroupTemplate',
                fs.readFileSync(
                    path.join(env.ROOT_PATH, `self-assessments/tests/assets/2-file-facility-group-template.xlsx`)
                ),
                '2-file-facility-group-template.xlsx'
            )
            .isCreated();

        const { body } = await testHelper.get('/self-assessments').authenticate(userToken).isOk();
        firstGroup = body.groups[0];
        const selfAssessment = body.selfAssessment;
        const firstQuestion = firstGroup.questions[0];
        firstQuestionResponse = firstQuestion.questionResponses[0];
        value = faker.datatype.string();

        createdAnswerAssessment = await selfAssessmentTestHelper.createAnswer({
            groupId: firstGroup.id,
            selfAssessmentId: selfAssessment.id,
            selfAssessmentQuestionId: firstQuestion.id,
            values: [
                {
                    value,
                    selfAssessmentQuestionResponseId: firstQuestionResponse.id
                }
            ]
        });
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Get new list questions with invalid role ', async () => {
        return testHelper.get('/self-assessments').authenticate(superAdminToken).isForbiddenError();
    });

    it('Get new list questions with invalid token ', async () => {
        return testHelper.get('/self-assessments').authenticate(testHelper.fakeUUID()).isAuthError();
    });

    it('Get new list questions', async () => {
        const selfAssessment = await getSelfAssessment(userToken);

        expect(selfAssessment.isDraft).toEqual(true);
        expect(selfAssessment.completedSaqAt).toEqual(null);
    });

    it('Get list answer assessments', async () => {
        const { body } = await getAnswerAssessment(userToken);

        const firstAnswerAssessment = body[0];
        expect(firstAnswerAssessment.id).toBe(createdAnswerAssessment.id);
        expect(firstAnswerAssessment.groupId).toBe(createdAnswerAssessment.groupId);
        expect(firstAnswerAssessment.selfAssessmentId).toBe(createdAnswerAssessment.selfAssessmentId);
        expect(firstAnswerAssessment.selfAssessmentQuestionId).toBe(createdAnswerAssessment.selfAssessmentQuestionId);

        const firstAnswer = firstAnswerAssessment.answers[0];
        expect(firstAnswer.value).toBe(value);
        expect(firstAnswer.questionResponse.id).toBe(firstQuestionResponse.id);
        expect(firstAnswer.questionResponse.option).toBe(firstQuestionResponse.option);
    });

    it('Get list answer assessments with invalid token ', async () => {
        return testHelper.get('/self-assessments/answers').authenticate(testHelper.fakeUUID()).isAuthError();
    });

    it('Get list role with file', async () => {
        const { body } = await testHelper.get('/self-assessments/list-role-with-file').authenticate(superAdminToken);
        expect(body[0].fileSaq).toHaveProperty('link');
        expect(body[0].fileFacilityGroupTemplate).toHaveProperty('link');
    });

    it('Validate answer questions when answer not has value with number', async () => {
        const numberTypeQuestion = firstGroup.questions.find(
            ({ type }) => type === SelfAssessmentQuestionTypesEnum.NUMBER
        );

        const answers = [
            {
                selfAssessmentQuestionId: numberTypeQuestion.id,
                answerValues: [
                    {
                        selfAssessmentQuestionResponseId: first(numberTypeQuestion.questionResponses).id
                    }
                ]
            }
        ];

        const { body } = await testHelper
            .post('/self-assessments/answers')
            .authenticate(userToken)
            .send({ answers })
            .isOk();

        expect(body).toContainEqual({
            title: firstGroup.title,
            questionOrder: numberTypeQuestion.order,
            error: trans('validation.invalid_answer_self_assessment')
        });
    });

    it('Validate answer questions when selfAssessmentQuestionId is fake', async () => {
        const numberTypeQuestion = firstGroup.questions.find(
            ({ type }) => type === SelfAssessmentQuestionTypesEnum.NUMBER
        );

        const answers = [
            {
                selfAssessmentQuestionId: testHelper.fakeUUID(),
                answerValues: [
                    {
                        selfAssessmentQuestionResponseId: first(numberTypeQuestion.questionResponses).id
                    }
                ]
            }
        ];

        await testHelper.post('/self-assessments/answers').authenticate(userToken).send({ answers }).isValidateError();
    });

    it('Validate answer questions when selfAssessmentQuestionResponseId is fake', async () => {
        const numberTypeQuestion = firstGroup.questions.find(
            ({ type }) => type === SelfAssessmentQuestionTypesEnum.NUMBER
        );

        const answers = [
            {
                selfAssessmentQuestionId: numberTypeQuestion.id,
                answerValues: [
                    {
                        selfAssessmentQuestionResponseId: testHelper.fakeUUID()
                    }
                ]
            }
        ];

        await testHelper.post('/self-assessments/answers').authenticate(userToken).send({ answers }).isValidateError();
    });

    it('Validate answer questions when answer with multi choice type successfully', async () => {
        const multiChoiceTypeQuestion = firstGroup.questions.find(
            ({ type }) => type === SelfAssessmentQuestionTypesEnum.MULTI_CHOICE
        );
        const selfAssessmentQuestionId = multiChoiceTypeQuestion.id;
        const selfAssessmentQuestionResponseId = multiChoiceTypeQuestion.questionResponses[0].id;

        const answers = [
            {
                selfAssessmentQuestionId,
                answerValues: [
                    {
                        selfAssessmentQuestionResponseId
                    }
                ]
            }
        ];

        const { body } = await testHelper
            .post('/self-assessments/answers')
            .authenticate(userToken)
            .send({ answers })
            .isOk();

        expect(body).not.toContainEqual({
            title: firstGroup.title,
            questionOrder: multiChoiceTypeQuestion.order,
            error: trans('validation.invalid_answer_self_assessment')
        });
    });

    it('Download template', async () => {
        let shortToken: string;
        await testHelper
            .post('/auth/short-token')
            .authenticate(superAdminToken)
            .isCreated()
            .then(({ body }) => {
                expect(body).toHaveProperty('shortToken');
                shortToken = body.shortToken;
            });

        await testHelper
            .get(`/self-assessments/download-template?roleId=${role.id}&shortToken=${shortToken}`)
            .expect(200)
            .expect('Content-Disposition', 'attachment; filename="templates.zip"');
    });

    it('Import self assessment', async () => {
        const { body } = await testHelper
            .post('/self-assessments/import')
            .authenticate(superAdminToken)
            .type('form')
            .field('roleId', role.id)
            .attach(
                'fileSaq',
                fs.readFileSync(path.join(env.ROOT_PATH, `self-assessments/tests/assets/1-file-saq.xlsx`)),
                '1-file-saq.xlsx'
            )
            .attach(
                'fileFacilityGroupTemplate',
                fs.readFileSync(
                    path.join(env.ROOT_PATH, `self-assessments/tests/assets/2-file-facility-group-template.xlsx`)
                ),
                '2-file-facility-group-template.xlsx'
            );

        expect(body.result).toBe(true);
    });

    describe('Validate import self assessment', () => {
        const url = '/self-assessments/import/validate';

        it('Validate import self assessment not valid: Miss sheets', async () => {
            await testHelper
                .post(url)
                .authenticate(superAdminToken)
                .set('Content-Type', 'multipart/form-data')
                .field('roleId', role.id)
                .attach(
                    'fileSaq',
                    fs.readFileSync(path.join(env.ROOT_PATH, `self-assessments/tests/assets/error-file-empty.xlsx`)),
                    'error-file-empty.xlsx'
                )
                .attach(
                    'fileFacilityGroupTemplate',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `self-assessments/tests/assets/2-file-facility-group-template.xlsx`)
                    ),
                    '2-file-facility-group-template.xlsx'
                )
                .isBadRequestError();
        });

        it('Validate import self assessment not valid: Not have enough columns', async () => {
            const { body } = await testHelper
                .post(url)
                .authenticate(superAdminToken)
                .set('Content-Type', 'multipart/form-data')
                .field('roleId', role.id)
                .attach(
                    'fileSaq',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `self-assessments/tests/assets/error-file-not-have-column.xlsx`)
                    ),
                    'error-file-not-have-column.xlsx'
                )
                .attach(
                    'fileFacilityGroupTemplate',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `self-assessments/tests/assets/2-file-facility-group-template.xlsx`)
                    ),
                    '2-file-facility-group-template.xlsx'
                );

            expect(body[0].validation.validatedItemCount).toEqual(0);
        });

        it('Validate import self assessment data is not valid', async () => {
            const files = ['error-response-type-not-valid.xlsx', 'error-go-to-not-valid.xlsx'];

            for (const file of files) {
                await testHelper
                    .post(url)
                    .authenticate(superAdminToken)
                    .set('Content-Type', 'multipart/form-data')
                    .field('roleId', role.id)
                    .attach(
                        'fileSaq',
                        fs.readFileSync(path.join(env.ROOT_PATH, `self-assessments/tests/assets/${file}`)),
                        file
                    )
                    .attach(
                        'fileFacilityGroupTemplate',
                        fs.readFileSync(
                            path.join(
                                env.ROOT_PATH,
                                `self-assessments/tests/assets/2-file-facility-group-template.xlsx`
                            )
                        ),
                        '2-file-facility-group-template.xlsx'
                    )
                    .isBadRequestError();
            }
        });

        it('Validate import self assessment valid', async () => {
            const { body } = await testHelper
                .post(url)
                .authenticate(superAdminToken)
                .set('Content-Type', 'multipart/form-data')
                .field('roleId', role.id)
                .attach(
                    'fileSaq',
                    fs.readFileSync(path.join(env.ROOT_PATH, `self-assessments/tests/assets/1-file-saq.xlsx`)),
                    'valid-file.xlsx'
                )
                .attach(
                    'fileFacilityGroupTemplate',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `self-assessments/tests/assets/2-file-facility-group-template.xlsx`)
                    ),
                    '2-file-facility-group-template.xlsx'
                );

            expect(body.length).toEqual(0);
        });
    });
});
