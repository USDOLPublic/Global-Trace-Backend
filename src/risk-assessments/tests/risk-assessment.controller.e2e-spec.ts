import assert from 'assert';
import _ from 'lodash';
import { TestHelper } from '~core/tests/test.helper';
import { RiskAssessmentEntity } from '~risk-assessments/entities/risk-assessment.entity';
import { MethodologyEnum } from '~risk-assessments/enums/methodology.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';
import faker from 'faker';
import { RolePermissionTestHelper } from '~role-permissions/tests/role-permission-test.helper';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';

describe('RiskAssessmentController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let superAdmin: UserEntity;
    let rolePermissionTestHelper = testHelper.getTestHelperModule(RolePermissionTestHelper);

    const path = '/risk-assessments';

    beforeAll(async () => {
        await testHelper.initialize();
        superAdmin = await userTestHelper.createUser({}, UserRoleEnum.SUPER_ADMIN);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Super Admin get risk assessment', () => {
        it('Get risk assessment successfully', async () => {
            return testHelper
                .get(path)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk()
                .has([
                    'id',
                    'createdAt',
                    'updatedAt',
                    'methodology',
                    'geographyWeight',
                    'listOfGoodsWeight',
                    'saqsWeight',
                    'dnaWeight',
                    'hotlineWeight',
                    'roleWeights'
                ]);
        });
    });

    describe('Super Admin get submit report roles', () => {
        it('Get submit report roles successfully', async () => {
            return testHelper
                .get('/risk-assessments/submit-report-roles')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk()
                .then(async ({ body }) => {
                    const item = body[0];
                    if (item) {
                        expect(item).toHaveProperty('id');
                        expect(item).toHaveProperty('createdAt');
                        expect(item).toHaveProperty('updatedAt');
                        expect(item).toHaveProperty('name');
                        expect(item).toHaveProperty('type');
                        expect(item).toHaveProperty('chainOfCustody');
                    }
                });
        });
    });

    describe('Super Admin edit risk assessment', () => {
        it('Edit risk assessment successfully', async () => {
            const permission = await rolePermissionTestHelper.createPermission({
                action: PermissionEnum.SUBMIT_REPORTS
            });
            const role = await rolePermissionTestHelper.createRole(
                {
                    name: faker.lorem.word(),
                    type: RoleTypeEnum.LABOR
                },
                [permission.id]
            );

            return testHelper
                .put(path)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    methodology: MethodologyEnum.WEIGHTED_AVERAGE,
                    geographyWeight: 10,
                    listOfGoodsWeight: 10,
                    saqsWeight: 10,
                    dnaWeight: 10,
                    hotlineWeight: 10,
                    roleWeights: [{ roleId: role.id, weight: 1 }]
                })
                .isNoContent()
                .then(async () => {
                    await testHelper.visibleInDatabase(RiskAssessmentEntity, {
                        methodology: MethodologyEnum.WEIGHTED_AVERAGE,
                        geographyWeight: 10,
                        listOfGoodsWeight: 10,
                        saqsWeight: 10,
                        dnaWeight: 10,
                        hotlineWeight: 10
                    });
                });
        });

        it('Edit risk assessment failed: Missing required field when methodology is Weighted Average.', async () => {
            return testHelper
                .put(path)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    methodology: MethodologyEnum.WEIGHTED_AVERAGE
                })
                .isValidateError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');

                    const geographyWeight = _.get(body, 'errors.geographyWeight.messages[0]');
                    const listOfGoodsWeight = _.get(body, 'errors.listOfGoodsWeight.messages[0]');

                    assert.strictEqual(
                        geographyWeight,
                        'Geography Weight must be a number conforming to the specified constraints'
                    );
                    assert.strictEqual(
                        listOfGoodsWeight,
                        'List Of Goods Weight must be a number conforming to the specified constraints'
                    );
                });
        });
    });
});
