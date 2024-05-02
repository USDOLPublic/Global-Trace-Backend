import fs from 'fs';
import path from 'path';
import { env } from '~config/env.config';
import assert from 'assert';
import faker from 'faker';
import { TestHelper } from '~core/tests/test.helper';
import { UserTestHelper } from '~users/tests/user-test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { UserEntity } from '~users/entities/user.entity';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { RolePermissionTestHelper } from '~role-permissions/tests/role-permission-test.helper';
import { UploadTaxonomyExploitationActionEnum } from '~files/enums/upload-taxonomy-of-exploitation-action.enum';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { AdditionalRoleEnum } from '~facilities/enums/additional-role.enum';

describe('FacilityGroupController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let rolePermissionTestHelper = testHelper.getTestHelperModule(RolePermissionTestHelper);

    let permission: PermissionEntity;
    let role: RoleEntity;
    let adminUser: UserEntity;
    let adminToken: string;
    let superAdmin: UserEntity;
    let superAdminToken: string;
    let facilityId: string;
    const wrongId = '00000000-0000-0000-0000-000000000000';

    beforeAll(async () => {
        await testHelper.initialize();
        adminUser = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        adminToken = await userTestHelper.getToken(adminUser);
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
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('API without authentication', () => {
        it('Should fail without authentication', async () => {
            await testHelper.get(`/facility-groups`).isAuthError();
        });

        it('Should fail with wrong token', async () => {
            await testHelper.get(`/facility-groups`).authenticate(faker.datatype.string()).isAuthError();
        });
    });

    describe('Test cases for valid download facility groups', () => {
        it('Valid download facility group template fail: file has not imported', async () => {
            await testHelper.get(`/facility-groups/valid-download-template?roleId=${role.id}`).isBadRequestError();
        });
    });

    describe('Test cases for download facility groups', () => {
        beforeAll(async () => {
            await importTaxonomyAndSelfAssessments();
        });

        it('Valid download facility group template successfully', async () => {
            const { body } = await testHelper.get(`/facility-groups/valid-download-template?roleId=${role.id}`).isOk();
            expect(body.roleId).toEqual(role.id);
        });

        it('Download facility group template successfully', async () => {
            let shortToken: string;
            await testHelper
                .post('/auth/short-token')
                .authenticate(adminToken)
                .isCreated()
                .then(({ body }) => {
                    expect(body).toHaveProperty('shortToken');
                    shortToken = body.shortToken;
                });
            await testHelper
                .get(`/facility-groups/download-template?roleId=${role.id}&shortToken=${shortToken}`)
                .expect(200)
                .expect('Access-Control-Allow-Headers', 'X-Requested-With')
                .expect('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                .expect('Content-Disposition', 'attachment; filename="facility-group-template.xlsx"');
        });

        it('Download facility group template fail: missing roleId param', async () => {
            let shortToken: string;
            await testHelper
                .post('/auth/short-token')
                .authenticate(adminToken)
                .isCreated()
                .then(({ body }) => {
                    expect(body).toHaveProperty('shortToken');
                    shortToken = body.shortToken;
                });
            await testHelper
                .get(`/facility-groups/download-template?shortToken=${shortToken}`)
                .isBadRequestError()
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'RoleID is invalid');
                });
        });
    });

    describe('Test cases for validate import facility groups template', () => {
        let url: string;

        beforeAll(async () => {
            url = `/facility-groups/validate-import-template?roleId=${role.id}&isUpdating=false`;
        });

        it('Throw error when invalid role user', async () => {
            const brandUser = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
            const brandToken = await userTestHelper.getToken(brandUser);
            await testHelper
                .post(url)
                .authenticate(brandToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `facilities/tests/assets/facility-groups/facility-group-template.xlsx`)
                    ),
                    `facility-group-template.xlsx`
                )
                .isForbiddenError();
        });

        it('Throw error when have not admin token', async () => {
            await testHelper
                .post(url)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `facilities/tests/assets/facility-groups/facility-group-template.xlsx`)
                    ),
                    `facility-group-template.xlsx`
                )
                .isAuthError();
        });

        it('Throw error when invalid roleId', async () => {
            await testHelper
                .post(`/facility-groups/validate-import-template?roleId=${wrongId}`)
                .authenticate(adminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `facilities/tests/assets/facility-groups/facility-group-template.xlsx`)
                    ),
                    `facility-group-template.xlsx`
                )
                .isBadRequestError()
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'RoleID is invalid');
                });
        });

        it('Throw error when empty values for sheet Farm Level Risk Assessment', async () => {
            await testHelper
                .post(url)
                .authenticate(adminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(env.ROOT_PATH, `facilities/tests/assets/facility-groups/facility-group-template.xlsx`)
                    ),
                    `facility-group-template.xlsx`
                )
                .isBadRequestError()
                .then(async ({ body }) => {
                    assert.strictEqual(body.message, 'Farm group must include at least 1 farm');
                });
        });

        it('Throw error when empty Farm Group Id value of sheet Farm group definition', async () => {
            const { body } = await testHelper
                .post(url)
                .authenticate(adminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `facilities/tests/assets/facility-groups/community-level-risk-assessment-empty-all-values.xlsx`
                        )
                    ),
                    'community-level-risk-assessment-empty-all-values.xlsx'
                )
                .isCreated();

            const errors = body.validationErrors[0].errors;
            expect(errors[0].error).toEqual('Farm Group ID is required');
        });

        it('Throw error when empty values for sheet Community Level Risk Assessment', async () => {
            const { body } = await testHelper
                .post(url)
                .authenticate(adminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `facilities/tests/assets/facility-groups/community-level-risk-assessment-empty-all-values.xlsx`
                        )
                    ),
                    'community-level-risk-assessment-empty-all-values.xlsx'
                )
                .isCreated();
            const errors = body.validationErrors[1].errors;
            expect(errors.length).toEqual(5);
        });

        it('Throw error when invalid "Have there been any OSH incidents identified at a local health clinic  involving anyone under the age of 18, injured at work in a facility?" for sheet Community Level Risk Assessment', async () => {
            const { body } = await testHelper
                .post(url)
                .authenticate(adminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `facilities/tests/assets/facility-groups/community-level-risk-assessment-invalid-values-column-1.xlsx`
                        )
                    ),
                    'community-level-risk-assessment-invalid-values-column-1.xlsx'
                )
                .isCreated();
            const errors = body.validationErrors[1].errors;
            expect(errors[0].error).toEqual('Invalid self-assessment answer or no answer');
        });

        it('Throw error when invalid "Is there a primary and secondary schools in this community?" for sheet Community Level Risk Assessment', async () => {
            const { body } = await testHelper
                .post(url)
                .authenticate(adminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `facilities/tests/assets/facility-groups/community-level-risk-assessment-invalid-values-column-2.xlsx`
                        )
                    ),
                    'community-level-risk-assessment-invalid-values-column-2.xlsx'
                )
                .isCreated();
            const errors = body.validationErrors[1].errors;
            expect(errors[0].error).toEqual('Invalid self-assessment answer or no answer');
        });

        it('Throw error when empty "ID", "Farm Name" "Latitude", "Longitude", "Contact First Name", "Contact Last Name" for sheet Farm Level Risk Assessment', async () => {
            const { body } = await testHelper
                .post(url)
                .authenticate(adminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `facilities/tests/assets/facility-groups/farm-level-risk-assessment-empty-many-other-values.xlsx`
                        )
                    ),
                    'farm-level-risk-assessment-empty-many-other-values.xlsx'
                )
                .isCreated();
            const errorsArray = [
                'ID is required',
                'Farm Name is required',
                'Contact First Name is required',
                'Contact Last Name is required'
            ];
            const errors = body.validationErrors[2].errors;
            for (let i = 0; i < errorsArray.length; i++) {
                expect(errors[i].error).toEqual(errorsArray[i]);
            }
        });

        it('Throw error when empty "ID" for sheet Farm Level Risk Assessment', async () => {
            const { body } = await testHelper
                .post(url)
                .authenticate(adminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `facilities/tests/assets/facility-groups/farm-level-risk-assessment-empty-value-id.xlsx`
                        )
                    ),
                    'farm-level-risk-assessment-empty-value-id.xlsx'
                )
                .isCreated();
            const errors = body.validationErrors[2].errors;
            expect(errors[0].error).toEqual('ID is required');
        });

        it('Throw error when invalid "Certification", "Certification expiry date" for sheet Farm Level Risk Assessment', async () => {
            const { body } = await testHelper
                .post(url)
                .authenticate(adminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `facilities/tests/assets/facility-groups/farm-level-risk-assessment-invalid-certification-and-certification-expiry-date.xlsx`
                        )
                    ),
                    'farm-level-risk-assessment-invalid-certification-and-certification-expiry-date.xlsx'
                )
                .isCreated();
            const errorsArray = ['Invalid Certification options', 'Date format must be dd/mm/yyyy'];
            const errors = body.validationErrors[2].errors;
            for (let i = 0; i < errorsArray.length; i++) {
                expect(errors[i].error).toEqual(errorsArray[i]);
            }
        });

        it('Validate import facility groups template successfully', async () => {
            const { body } = await testHelper
                .post(url)
                .authenticate(adminToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(
                        path.join(
                            env.ROOT_PATH,
                            `facilities/tests/assets/facility-groups/facility-group-template-success.xlsx`
                        )
                    ),
                    'facility-group-template-success.xlsx'
                )
                .isCreated();

            expect(body.totalItems).toEqual(body.validatedItemCount);
            expect(body).toHaveProperty('fileId');
        });
    });

    describe('Test cases for import facility groups template', () => {
        it('Throw error when missing roleId in payload', async () => {
            const fileId = await getFileId('facility-group-template-success.xlsx');
            await testHelper
                .post('/facility-groups/import-data')
                .authenticate(adminToken)
                .send({
                    fileId
                })
                .isValidateError();
        });

        it('Should be import facility groups template successfully', async () => {
            const fileId = await getFileId('facility-group-template-success.xlsx');
            await testHelper
                .post('/facility-groups/import-data')
                .authenticate(adminToken)
                .send({
                    fileId,
                    roleId: role.id
                })
                .isCreated();

            const facility = await FacilityRepository.make().findOne({
                where: { additionalRole: AdditionalRoleEnum.FARM_GROUP },
                order: { createdAt: 'DESC' }
            });
            facilityId = facility.id;
        });
    });

    describe('Test cases for update import facility groups template', () => {
        let url: string;
        let fileId: string;

        beforeAll(async () => {
            url = `/facility-groups/${facilityId}/import-data`;
            fileId = await getFileId('facility-group-template-update.xlsx', facilityId, true);
        });

        it('Throw error when invalid id', async () => {
            await testHelper
                .put(`/facility-groups/${wrongId}/import-data`)
                .authenticate(adminToken)
                .send({
                    fileId,
                    roleId: role.id
                })
                .isNotFound();
        });

        it('Throw error when missing roleId in payload', async () => {
            await testHelper
                .put(url)
                .authenticate(adminToken)
                .send({
                    fileId
                })
                .isValidateError();
        });

        it('Should be update import facility groups template successfully', async () => {
            await testHelper
                .put(url)
                .authenticate(adminToken)
                .send({
                    fileId,
                    roleId: role.id
                })
                .isNoContent();
        });
    });

    async function importTaxonomyAndSelfAssessments() {
        const baseUrl = '/taxonomy-exploitations/upload-templates';
        const { body } = await testHelper
            .post(baseUrl)
            .authenticate(superAdminToken)
            .set('Content-Type', 'multipart/form-data')
            .attach(
                'file',
                fs.readFileSync(
                    path.join(env.ROOT_PATH, `facilities/tests/assets/facility-groups/Taxonomy_of_Exploitation.xlsx`)
                ),
                'Taxonomy_of_Exploitation.xlsx'
            )
            .isCreated();
        await testHelper
            .post(`${baseUrl}/${body.fileId}`)
            .authenticate(superAdminToken)
            .send({ action: UploadTaxonomyExploitationActionEnum.ADD })
            .isCreated();

        await testHelper
            .post('/self-assessments/import')
            .authenticate(superAdminToken)
            .type('form')
            .field('roleId', role.id)
            .attach(
                'fileSaq',
                fs.readFileSync(
                    path.join(env.ROOT_PATH, `facilities/tests/assets/facility-groups/SAQ(facility-group).xlsx`)
                ),
                'SAQ(facility-group).xlsx'
            )
            .attach(
                'fileFacilityGroupTemplate',
                fs.readFileSync(
                    path.join(env.ROOT_PATH, `facilities/tests/assets/facility-groups/facility-group-template.xlsx`)
                ),
                'facility-group-template.xlsx'
            )
            .isCreated();
    }

    async function getFileId(fileName: string, facilityGroupId: string = '', isUpdating: boolean = false) {
        const { body } = await testHelper
            .post(
                `/facility-groups/validate-import-template?roleId=${role.id}&facilityGroupId=${facilityGroupId}&isUpdating=${isUpdating}`
            )
            .authenticate(adminToken)
            .set('Content-Type', 'multipart/form-data')
            .attach(
                'file',
                fs.readFileSync(path.join(env.ROOT_PATH, `facilities/tests/assets/facility-groups/${fileName}`)),
                `${fileName}`
            )
            .isCreated();
        return body.fileId;
    }
});
