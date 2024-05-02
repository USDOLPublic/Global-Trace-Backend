import excel from 'exceljs';
import fs from 'fs';
import path from 'path';
import { env } from '~config/env.config';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { ProductDefinitionTestHelper } from '~product-definitions/tests/product-definition-test.helper';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RolePermissionTestHelper } from '~role-permissions/tests/role-permission-test.helper';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { UserRepository } from '~users/repositories/user.repository';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('FileController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    let rolePermissionTestHelper = testHelper.getTestHelperModule(RolePermissionTestHelper);
    let supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
    let productDefinitionTestHelper = testHelper.getTestHelperModule(ProductDefinitionTestHelper);

    let adminUser: UserEntity;
    let brandUser: UserEntity;
    let ginner: UserEntity;
    let adminToken: string;
    let brandToken: string;

    let createdSpinnerRole: RoleEntity;
    let createdMillRole: RoleEntity;
    let createdGinnerRole: RoleEntity;

    beforeAll(async () => {
        await testHelper.initialize();
        brandUser = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        brandToken = await userTestHelper.getToken(brandUser);
        adminUser = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        adminToken = await userTestHelper.getToken(adminUser);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Test cases for import suppliers', () => {
        beforeAll(async () => {
            const email = 'email@example.com';
            ginner = await userTestHelper.createUser({ email }, UserRoleEnum.GINNER);
            await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);

            const { id: outputProductDefinitionId } = await productDefinitionTestHelper.createProductDefinition();

            createdSpinnerRole = await rolePermissionTestHelper.createRole(
                {
                    name: 'SPINNER',
                    type: RoleTypeEnum.PRODUCT,
                    chainOfCustody: ChainOfCustodyEnum.PRODUCT_SEGREGATION
                },
                ['a32f25cd-881e-45b1-9601-91b5092fa286', '0a107bbb-520d-4a42-994f-8dc9c882861d']
            );

            createdMillRole = await rolePermissionTestHelper.createRole(
                {
                    name: 'MILL',
                    type: RoleTypeEnum.PRODUCT,
                    chainOfCustody: ChainOfCustodyEnum.PRODUCT_SEGREGATION
                },
                ['a32f25cd-881e-45b1-9601-91b5092fa286', '0a107bbb-520d-4a42-994f-8dc9c882861d']
            );

            createdGinnerRole = await rolePermissionTestHelper.createRole(
                {
                    name: 'GINNER',
                    type: RoleTypeEnum.PRODUCT,
                    chainOfCustody: ChainOfCustodyEnum.PRODUCT_SEGREGATION
                },
                ['a32f25cd-881e-45b1-9601-91b5092fa286', '0a107bbb-520d-4a42-994f-8dc9c882861d']
            );

            await supplyChainTestHelper.createMany([
                {
                    roleId: createdSpinnerRole.id,
                    fromRoleId: createdMillRole.id,
                    outputProductDefinitionId
                },
                { roleId: createdMillRole.id, fromRoleId: createdGinnerRole.id, outputProductDefinitionId }
            ]);
        });

        it('Upload file with correct supplier template data ', async () => {
            const { body } = await testHelper
                .post('/files/validate-supplier-templates')
                .authenticate(brandToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(path.join(env.ROOT_PATH, `files/tests/assets/test-excel.xlsx`)),
                    'test-excel.xlsx'
                )
                .isCreated();

            expect(body.validatedItemCount).toEqual(1);
        });

        it('Upload file with correct supplier template data and not have brandToken', async () => {
            await testHelper
                .post('/files/validate-supplier-templates')
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(path.join(env.ROOT_PATH, `files/tests/assets/test-excel.xlsx`)),
                    'test-excel.xlsx'
                )
                .isAuthError();
        });

        it('Upload file with correct supplier template data but invalid role', async () => {
            await testHelper
                .post('/files/validate-supplier-templates')
                .set('Content-Type', 'multipart/form-data')
                .authenticate(adminToken)
                .attach('file', fs.readFileSync(path.join(env.ROOT_PATH, `files/tests/assets/test-excel.xlsx`)))
                .isForbiddenError();
        });

        it('Upload file with correct supplier template data and empty all columns values', async () => {
            const { body } = await testHelper
                .post('/files/validate-supplier-templates')
                .authenticate(brandToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(path.join(env.ROOT_PATH, `files/tests/assets/empty-value-columns.xlsx`)),
                    'empty-value-columns.xlsx'
                )
                .isCreated();

            expect(body.validationErrors).toEqual([]);
            expect(body.validated).toEqual(undefined);
        });

        it('Upload file with correct supplier template data and empty values in require columns', async () => {
            const { body } = await testHelper
                .post('/files/validate-supplier-templates')
                .authenticate(brandToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(path.join(env.ROOT_PATH, `files/tests/assets/empty-require-columns.xlsx`)),
                    'empty-require-columns.xlsx'
                )
                .isCreated();

            const errors = body.validationErrors[0].errors;
            expect(errors[0].error).toEqual('Business Name is required');
            expect(errors[1].error).toEqual('Facility Type is required');
        });

        it('Upload file with correct supplier template data and invalid values in require columns', async () => {
            const { body } = await testHelper
                .post('/files/validate-supplier-templates')
                .authenticate(brandToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(path.join(env.ROOT_PATH, `files/tests/assets/invalid-require-columns.xlsx`)),
                    'invalid-require-columns.xlsx'
                )
                .isCreated();

            const errors = body.validationErrors[0].errors;
            expect(errors[1].error).toBe('Invalid Facility Type');
        });

        it('Upload file with invalid "Business Name", "firstName", "lastName" and "email"', async () => {
            const { body } = await testHelper
                .post('/files/validate-supplier-templates')
                .authenticate(brandToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(path.join(env.ROOT_PATH, `files/tests/assets/invalid-not-require-columns.xlsx`)),
                    'invalid-not-require-columns.xlsx'
                )
                .isCreated();

            const errors = body.validationErrors[0].errors;
            expect(body.validatedItemCount).toBe(0);
            expect(errors[0].error).toBe('Business Name is required');
            expect(errors[1].error).toBe('First Name is required');
            expect(errors[2].error).toBe('Last Name is required');
            expect(errors[3].error).toBe('Email is required');
        });

        it('Upload file with invalid email', async () => {
            const { body } = await testHelper
                .post('/files/validate-supplier-templates')
                .authenticate(brandToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(path.join(env.ROOT_PATH, `files/tests/assets/invalid-email.xlsx`)),
                    'invalid-email.xlsx'
                )
                .isCreated();

            const errors = body.validationErrors[0].errors;
            expect(errors[0].error).toBe('Invalid Email');
        });

        it('Upload file with duplicate email in file template', async () => {
            const { body } = await testHelper
                .post('/files/validate-supplier-templates')
                .authenticate(brandToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(path.join(env.ROOT_PATH, `files/tests/assets/duplicate-email.xlsx`)),
                    'duplicate-email.xlsx'
                )
                .isCreated();

            const errors = body.validationErrors[0].errors;
            expect(errors[0].error).toBe('Email is already assigned to another business');
        });
    });

    describe('Test cases for import suppliers by id', () => {
        let fileId: string;

        beforeAll(async () => {
            const { body } = await testHelper
                .post('/files/validate-supplier-templates')
                .authenticate(brandToken)
                .set('Content-Type', 'multipart/form-data')
                .attach(
                    'file',
                    fs.readFileSync(path.join(env.ROOT_PATH, `files/tests/assets/test-excel.xlsx`)),
                    'test-excel.xlsx'
                )
                .isCreated();
            fileId = body.fileId;
        });

        it('Import suppliers with correct supplier template data ', async () => {
            await testHelper.post(`/files/${fileId}/import-suppliers`).authenticate(brandToken).isCreated();

            async function readSupplierTemplateData() {
                const workbook = new excel.Workbook();
                await workbook.xlsx.readFile(path.join(env.ROOT_PATH, `files/tests/assets/test-excel.xlsx`));
                let jsonData = [];
                workbook.worksheets.forEach(function (sheet) {
                    let firstRow = sheet.getRow(1);
                    if (!firstRow.cellCount) return;
                    let keys = firstRow.values;
                    sheet.eachRow((row, rowNumber) => {
                        if (rowNumber == 1) return;
                        let values = row.values;
                        let obj = {};
                        for (let i = 1; i < Number(keys.length); i++) {
                            obj[keys[i]] = values[i];
                        }
                        jsonData.push(obj);
                    });
                });
                return jsonData;
            }

            let dataFields = await readSupplierTemplateData();
            let emailInDB = dataFields[0].Email.text.toLowerCase();
            let firstNameInDB = dataFields[0]['First Name'];
            let lastNameInDB = dataFields[0]['Last name'];

            let user = await UserRepository.make().findOne({ where: { email: emailInDB } });
            let facilityOfUser = await FacilityRepository.make().findFacilityOfUser(user.id);

            expect(user.email).toEqual(emailInDB);
            expect(user.firstName).toEqual(firstNameInDB);
            expect(user.lastName).toEqual(lastNameInDB);
            expect(dataFields[0]['Business Name']).toEqual(facilityOfUser.name);
            expect(dataFields[0]['Business Reg. No']).toEqual(facilityOfUser.businessRegisterNumber);
            expect(dataFields[0]['OS ID']).toEqual(facilityOfUser.oarId);
        });
    });
});
