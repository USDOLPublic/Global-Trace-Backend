import assert from 'assert';
import faker from 'faker';
import { readFileSync } from 'fs';
import path from 'path';
import { env } from '~config/env.config';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityPartnerEntity } from '~facilities/entities/facility-partner.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityPartnerRepository } from '~facilities/repositories/facility-partner.repository';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { ProductDefinitionRepository } from '~product-definitions/repositories/product-definition.repository';
import { ProductDefinitionTestHelper } from '~product-definitions/tests/product-definition-test.helper';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { RolePermissionTestHelper } from '~role-permissions/tests/role-permission-test.helper';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('BrandController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    let rolePermissionTestHelper = testHelper.getTestHelperModule(RolePermissionTestHelper);
    let supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
    let productDefinitionTestHelper = testHelper.getTestHelperModule(ProductDefinitionTestHelper);

    let brand: UserEntity;
    let brandFacility: FacilityEntity;
    let createdSpinnerRole: RoleEntity;
    let createdMillRole: RoleEntity;
    let createdGinnerRole: RoleEntity;

    function checkAddSupplier(data: any, res: any): string {
        expect(res.name).toEqual(data.name);
        expect(res.oarId).toEqual(data.oarId);
        expect(res.businessRegisterNumber).toEqual(data.businessRegisterNumber);
        expect(res.typeId).toEqual(data.typeId);

        return res.id;
    }

    beforeAll(async () => {
        await testHelper.initialize();
        brand = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        brandFacility = await facilityTestHelper.create(brand, UserRoleEnum.BRAND);
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

    afterAll(async () => {
        await testHelper.close();
    });

    it('Update profile brand successfully', async () => {
        const brander = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        await facilityTestHelper.create(brander, UserRoleEnum.BRAND);

        await testHelper
            .put('/brands/profile')
            .type('form')
            .field('address', faker.address.streetAddress())
            .field('district', faker.address.city())
            .field('province', faker.address.state())
            .field('country', faker.address.country())
            .field('name', 'Test update profile')
            .attach(
                'logo',
                readFileSync(path.join(env.ROOT_PATH, 'core/tests/assets/dev-test-image.png')),
                'dev-test-image.png'
            )
            .authenticate(await userTestHelper.getToken(brander))
            .isNoContent();

        const facility = await FacilityRepository.make().findFacilityOfUser(brander.id);
        assert.strictEqual(facility.name, 'Test update profile');
    });

    it('Search suppliers by name successfully', async () => {
        const brandUser = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        await facilityTestHelper.create(brandUser, UserRoleEnum.BRAND);

        const ginnerName = faker.random.words(3);
        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        const ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER, { name: ginnerName });

        const productDefinition = await ProductDefinitionRepository.make().createOne({
            name: faker.name.title()
        });
        await supplyChainTestHelper.createSupplyChainNode({
            roleId: ginner.roleId,
            fromRoleId: brandUser.roleId,
            outputProductDefinitionId: productDefinition.id
        });

        await testHelper
            .get(`/brands/suppliers/search?key=${ginnerName}`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .isOk()
            .then(({ body }) => {
                expect(body).toHaveLength(1);
                expect(body[0]).toMatchObject({
                    id: ginnerFacility.id,
                    name: ginnerName
                });
            });
    });

    it('Get list roles successfully', async () => {
        const brandUser = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        await facilityTestHelper.create(brandUser, UserRoleEnum.BRAND);

        const { body } = await testHelper
            .get(`/brands/roles`)
            .authenticate(await userTestHelper.getToken(brandUser))
            .isOk();

        const spinnerRole = body.find(({ id }) => id === createdSpinnerRole.id);
        expect(spinnerRole.id).toBe(createdSpinnerRole.id);
        expect(spinnerRole.name).toEqual(createdSpinnerRole.name);
        expect(spinnerRole.type).toBe(createdSpinnerRole.type);
        expect(spinnerRole.chainOfCustody).toBe(createdSpinnerRole.chainOfCustody);
    });

    it('Brand get supplier mapping', async () => {
        let millFacilityId: string;
        await testHelper
            .post('/brands/suppliers')
            .send({
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                name: faker.internet.userName(),
                typeId: createdMillRole.id,
                businessRegisterNumber: faker.random.words(3),
                oarId: faker.random.words(3),
                businessPartnerIds: []
            })
            .authenticate(await userTestHelper.getToken(brand))
            .isCreated()
            .then(({ body }) => {
                millFacilityId = body.id;
            });

        let spinnerFacilityId: string;
        await testHelper
            .post('/brands/suppliers')
            .send({
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                name: faker.internet.userName(),
                typeId: createdSpinnerRole.id,
                businessRegisterNumber: faker.random.words(3),
                oarId: faker.random.words(3),
                businessPartnerIds: [millFacilityId]
            })
            .authenticate(await userTestHelper.getToken(brand))
            .isCreated()
            .then(({ body }) => {
                spinnerFacilityId = body.id;
            });

        return testHelper
            .get('/brands/suppliers/mapping')
            .authenticate(await userTestHelper.getToken(brand))
            .isOk()
            .then(({ body }) => {
                expect(body).toMatchObject([
                    [
                        {
                            type: createdSpinnerRole.name,
                            suppliers: [
                                {
                                    id: spinnerFacilityId,
                                    targets: [millFacilityId]
                                }
                            ]
                        },
                        {
                            type: createdMillRole.name,
                            suppliers: [
                                {
                                    id: millFacilityId,
                                    targets: [spinnerFacilityId]
                                }
                            ]
                        }
                    ]
                ]);
            });
    });

    it('Delete suppliers by id successfully', async () => {
        brand = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        brandFacility = await facilityTestHelper.create(brand, UserRoleEnum.BRAND);
        const farmSupplier = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.FARM, {
            name: 'delete supplier'
        });

        await testHelper
            .delete(`/brands/suppliers/${farmSupplier.id}`)
            .authenticate(await userTestHelper.getToken(brand))
            .isNoContent()
            .then(async () => {
                await testHelper.invisibleInDatabase(FacilityPartnerEntity, {
                    partnerId: farmSupplier.id
                });
            });
    });

    it('Edit suppliers by id successfully', async () => {
        brand = await userTestHelper.createUser({}, UserRoleEnum.BRAND);
        brandFacility = await facilityTestHelper.create(brand, UserRoleEnum.BRAND);
        const farmSupplier = await facilityTestHelper.addSupplier(brandFacility, UserRoleEnum.FARM, {
            name: 'Edit supplier'
        });

        await testHelper
            .put(`/brands/suppliers/${farmSupplier.id}`)
            .authenticate(await userTestHelper.getToken(brand))
            .send({
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                name: 'Update name test',
                typeId: createdMillRole.id,
                businessRegisterNumber: faker.random.words(3),
                oarId: faker.random.words(3),
                businessPartnerIds: []
            })
            .isNoContent();

        const supplierUpdate = await FacilityRepository.make().findById(farmSupplier.id);
        assert.strictEqual(supplierUpdate.name, 'Update name test');
    });

    it('Update business PartnerIds by id supplier successfully', async () => {
        let millFacilityId;
        await testHelper
            .post('/brands/suppliers')
            .send({
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                name: faker.internet.userName(),
                typeId: createdMillRole.id,
                businessRegisterNumber: faker.random.words(3),
                oarId: faker.random.words(3),
                businessPartnerIds: []
            })
            .authenticate(await userTestHelper.getToken(brand))
            .isCreated()
            .then(({ body }) => {
                millFacilityId = body.id;
            });

        let spinnerFacilityId;
        await testHelper
            .post('/brands/suppliers')
            .send({
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                name: faker.internet.userName(),
                typeId: createdSpinnerRole.id,
                businessRegisterNumber: faker.random.words(3),
                oarId: faker.random.words(3),
                businessPartnerIds: [millFacilityId]
            })
            .authenticate(await userTestHelper.getToken(brand))
            .isCreated()
            .then(({ body }) => {
                spinnerFacilityId = body.id;
            });

        await testHelper
            .put(`/brands/suppliers/${spinnerFacilityId}`)
            .send({
                name: 'Update name',
                typeId: createdSpinnerRole.id,
                businessPartnerIds: [millFacilityId]
            })
            .authenticate(await userTestHelper.getToken(brand))
            .isNoContent();

        const supplierUpdate = await FacilityRepository.make().findById(spinnerFacilityId);
        const facilityPartnerUpdate = await FacilityPartnerRepository.make().findOneByOrFail({
            facilityId: spinnerFacilityId
        });
        assert.strictEqual(facilityPartnerUpdate.partnerId, millFacilityId);
        assert.strictEqual(supplierUpdate.name, 'Update name');
    });

    it('Update supplier business partners successfully', async () => {
        const ginnerSupplierUser = await facilityTestHelper.createUser({ roleId: createdGinnerRole.id });
        const ginnerSupplier = await facilityTestHelper.create(ginnerSupplierUser, null, {
            typeId: createdGinnerRole.id
        });
        await facilityTestHelper.addPartner(brandFacility, ginnerSupplier);

        const data = {
            email: faker.internet.email(),
            firstName: testHelper.fakeFirstName(),
            lastName: testHelper.fakeLastName(),
            name: faker.internet.userName(),
            businessRegisterNumber: faker.random.words(3),
            typeId: createdMillRole.id,
            oarId: faker.random.words(3),
            businessPartnerIds: [ginnerSupplier.id]
        };

        let supplierFacilityId;
        const response = await testHelper
            .post('/brands/suppliers')
            .send(data)
            .authenticate(await userTestHelper.getToken(brand))
            .isCreated()
            .then(({ body }) => {
                return body;
            });

        supplierFacilityId = checkAddSupplier(data, response);

        await testHelper
            .put(`/brands/suppliers/${supplierFacilityId}`)
            .authenticate(await userTestHelper.getToken(brand))
            .send({
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                name: 'Update name test',
                typeId: createdMillRole.id,
                businessRegisterNumber: faker.random.words(3),
                oarId: faker.random.words(3),
                businessPartnerIds: []
            })
            .isNoContent();

        await testHelper.invisibleInDatabase(FacilityPartnerEntity, {
            facilityId: supplierFacilityId,
            partnerId: ginnerSupplier.id,
            ownerFacilityId: brandFacility.id
        });

        await testHelper.invisibleInDatabase(FacilityPartnerEntity, {
            facilityId: ginnerSupplier.id,
            partnerId: supplierFacilityId,
            ownerFacilityId: brandFacility.id
        });
    });

    it('Search business partners successfully', async () => {
        const businessName = faker.internet.userName();
        const ginnerSupplierUser = await facilityTestHelper.createUser({ roleId: createdGinnerRole.id });

        const ginnerSupplier = await facilityTestHelper.create(ginnerSupplierUser, null, {
            typeId: createdGinnerRole.id,
            name: businessName
        });
        await facilityTestHelper.addPartner(brandFacility, ginnerSupplier);

        const data = {
            email: faker.internet.email(),
            firstName: testHelper.fakeFirstName(),
            lastName: testHelper.fakeLastName(),
            name: faker.internet.userName(),
            businessRegisterNumber: faker.random.words(3),
            typeId: createdMillRole.id,
            oarId: faker.random.words(3),
            businessPartnerIds: [ginnerSupplier.id]
        };

        await testHelper
            .post('/brands/suppliers')
            .send(data)
            .authenticate(await userTestHelper.getToken(brand))
            .isCreated()
            .then((res) => res.body);

        const { body } = await testHelper
            .get(`/brands/business-partners`)
            .authenticate(await userTestHelper.getToken(brand))
            .query({ roleId: createdMillRole.id })
            .query({ key: businessName })
            .isOk();

        expect(body[0].id).toBe(ginnerSupplier.id);
    });

    it('Get list suppliers successfully ', async () => {
        return testHelper
            .get(`/brands/suppliers`)
            .authenticate(await userTestHelper.getToken(brand))
            .isOk();
    });

    describe('Test case for Brand add new supplier', () => {
        it('Add new supplier is successfully', async () => {
            const ginnerSupplierUser = await facilityTestHelper.createUser({ roleId: createdGinnerRole.id });
            const supplierFacility = await facilityTestHelper.create(ginnerSupplierUser, null, {
                typeId: createdGinnerRole.id
            });
            await facilityTestHelper.addPartner(brandFacility, supplierFacility);

            const data = {
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                name: faker.internet.userName(),
                businessRegisterNumber: faker.random.words(3),
                oarId: faker.random.words(3),
                typeId: createdMillRole.id,
                businessPartnerIds: [supplierFacility.id]
            };

            let supplierFacilityId: string;
            const response = await testHelper
                .post('/brands/suppliers')
                .send(data)
                .authenticate(await userTestHelper.getToken(brand))
                .isCreated()
                .then(({ body }) => {
                    return body;
                });

            supplierFacilityId = checkAddSupplier(data, response);

            await testHelper.visibleInDatabase(FacilityPartnerEntity, {
                facilityId: supplierFacilityId,
                partnerId: supplierFacility.id,
                ownerFacilityId: brandFacility.id
            });

            await testHelper.visibleInDatabase(FacilityPartnerEntity, {
                facilityId: supplierFacility.id,
                partnerId: supplierFacilityId,
                ownerFacilityId: brandFacility.id
            });
        });

        it('Add supplier fail because typeId is fake and businessPartnerId is fake', async () => {
            const data = {
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                name: faker.internet.userName(),
                typeId: testHelper.fakeUUID(),
                businessRegisterNumber: faker.random.words(3),
                oarId: faker.random.words(3),
                businessPartnerIds: [testHelper.fakeUUID()]
            };

            await testHelper
                .post('/brands/suppliers')
                .send(data)
                .authenticate(await userTestHelper.getToken(brand))
                .isValidateError();
        });

        it('Add supplier with tier 1 fail because not input oarId', async () => {
            const data = {
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                name: faker.internet.userName(),
                type: UserRoleEnum.FINAL_PRODUCT_ASSEMBLY,
                businessRegisterNumber: faker.random.words(3)
            };

            await testHelper
                .post('/brands/suppliers')
                .send(data)
                .authenticate(await userTestHelper.getToken(brand))
                .isValidateError();
        });

        it('Add supplier with tier 1 fail because not input businessRegisterNumber', async () => {
            const data = {
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                name: faker.internet.userName(),
                type: UserRoleEnum.FINAL_PRODUCT_ASSEMBLY,
                oarId: faker.random.words(3)
            };

            await testHelper
                .post('/brands/suppliers')
                .send(data)
                .authenticate(await userTestHelper.getToken(brand))
                .isValidateError();
        });
    });
});
