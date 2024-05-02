import assert from 'assert';
import faker from 'faker';
import _ from 'lodash';
import { TestHelper } from '~core/tests/test.helper';
import { RoleHasPermissionEntity } from '~role-permissions/entities/role-has-permission.entity';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';
import { RolePermissionTestHelper } from './role-permission-test.helper';
import { GroupTypeEnum } from '~role-permissions/enums/group-type.enum';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';

describe('RoleController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let rolePermissionTestHelper = testHelper.getTestHelperModule(RolePermissionTestHelper);
    let superAdmin: UserEntity;
    let newRole: RoleEntity;

    beforeAll(async () => {
        await testHelper.initialize();
        superAdmin = await userTestHelper.createUser({}, UserRoleEnum.SUPER_ADMIN);
        newRole = await rolePermissionTestHelper.createRole({ name: 'New Role' });
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Super Admin gets the list of roles', () => {
        it('Super Admin gets the list of roles successfully', async () => {
            return testHelper
                .get('/roles')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk();
        });

        it('Sort the list of roles by name:ASC successfully', async () => {
            return testHelper
                .get('/roles?sortFields=name:ASC')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk()
                .then(({ body }) => {
                    assert.strictEqual(body[0].name, 'ADMIN');
                });
        });

        it('Sort the list of roles by name:DESC successfully', async () => {
            return testHelper
                .get('/roles?sortFields=name:DESC')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk()
                .then(({ body }) => {
                    assert.strictEqual(body[0].name, 'SPINNER');
                });
        });

        it('Sort the list of roles by lastUpdate:ASC successfully', async () => {
            await rolePermissionTestHelper.createRole({ name: 'Aaa' });

            return testHelper
                .get('/roles?sortFields=lastUpdate:ASC')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk();
        });

        it('Sort the list of roles by lastUpdate:DESC successfully', async () => {
            await rolePermissionTestHelper.createRole({ name: 'Aaa' });

            return testHelper
                .get('/roles?sortFields=lastUpdate:DESC')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk();
        });

        it('Search the list of roles by name successfully', async () => {
            await rolePermissionTestHelper.createRole({ name: 'Aaa' });

            return testHelper
                .get('/roles?key=Aaa')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk()
                .then(({ body }) => {
                    assert.strictEqual(body[0].name, 'Aaa');
                });
        });
    });

    describe('Super Admin gets the list of roles has permission Administrator completes profile', () => {
        it('Super Admin gets the list of roles has permission Administrator completes profile successfully', async () => {
            const permission = await rolePermissionTestHelper.createPermission({
                action: PermissionEnum.ADMINISTRATOR_COMPLETES_PROFILE
            });
            const role = await rolePermissionTestHelper.createRole(
                {
                    name: faker.lorem.word()
                },
                [permission.id]
            );

            const { body } = await testHelper
                .get('/roles/administrator-completes-profile')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk();

            expect(body.map(({ name }) => name).includes(role.name)).toBeTruthy();
        });
    });

    describe('Super Admin view a role', () => {
        it('View role successfully', async () => {
            const role = await rolePermissionTestHelper.createRole();

            return testHelper
                .get(`/roles/${role.id}`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk()
                .has(['id', 'createdAt', 'updatedAt', 'name', 'type', 'chainOfCustody', 'permissions'])
                .then(({ body }) => {
                    expect(body).toMatchObject({
                        id: role.id
                    });
                });
        });
    });

    describe('Super Admin create a role', () => {
        it('Create role successfully', async () => {
            const permission = await rolePermissionTestHelper.createPermission({ groups: RoleTypeEnum.PRODUCT });

            return testHelper
                .post(`/roles`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: '123',
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    assignedPermissionIds: [permission.id]
                })
                .isCreated();
        });

        it('Create role failed: The name has already been taken.', async () => {
            await rolePermissionTestHelper.createRole({ name: 'NewRole' });
            const permission = await rolePermissionTestHelper.createPermission();

            return testHelper
                .post(`/roles`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: 'NewRole',
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    assignedPermissionIds: [permission.id]
                })
                .isValidateError()
                .then(validateErrorCallback);
        });

        it('Create role failed: Name must be longer than or equal to 1 characters', async () => {
            await rolePermissionTestHelper.createRole({ name: 'NewRole' });
            const permission = await rolePermissionTestHelper.createPermission();

            return testHelper
                .post(`/roles`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: '   ',
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    assignedPermissionIds: [permission.id]
                })
                .isValidateError()
                .then(({ body }) => {
                    assert.strictEqual(body.message, 'Validate Exception');

                    const message = _.get(body, 'errors.name.messages[0]');

                    assert.strictEqual(message, 'Name must be longer than or equal to 1 characters');
                });
        });

        it('Create role failed: The permission is assigned without parent permission.', async () => {
            const permission = await rolePermissionTestHelper.createPermission({ groups: RoleTypeEnum.PRODUCT });
            const subPermission = await rolePermissionTestHelper.createPermission({
                parentId: permission.id,
                groups: RoleTypeEnum.PRODUCT
            });

            return testHelper
                .post(`/roles`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: faker.random.words(20),
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    assignedPermissionIds: [subPermission.id]
                })
                .isValidateError()
                .has(['errors'])
                .then(({ body }) => {
                    validatePermissionWithoutParentError(body);
                });
        });

        it('Create role failed: Chain Of Custody must be a valid enum value', async () => {
            const permission = await rolePermissionTestHelper.createPermission();

            return testHelper
                .post(`/roles`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: faker.random.words(20),
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: 'Abc',
                    assignedPermissionIds: [permission.id]
                })
                .isValidateError()
                .has(['errors["chainOfCustody"]'])
                .then(({ body }) => {
                    validateChainOfCustodyError(body);
                });
        });

        it('Create role failed: The permission can only have one sub permission.', async () => {
            const permission = await rolePermissionTestHelper.createPermission({
                groupType: GroupTypeEnum.RADIO_GROUP,
                groups: RoleTypeEnum.PRODUCT
            });
            const subPermission = await rolePermissionTestHelper.createPermission({
                parentId: permission.id,
                groups: RoleTypeEnum.PRODUCT
            });
            const subPermission2 = await rolePermissionTestHelper.createPermission({
                parentId: permission.id,
                groups: RoleTypeEnum.PRODUCT
            });

            return testHelper
                .post(`/roles`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: faker.random.words(20),
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    assignedPermissionIds: [permission.id, subPermission.id, subPermission2.id]
                })
                .isValidateError()
                .has(['errors'])
                .then(({ body }) => {
                    validateSubPermissionError(body);
                });
        });

        it('Create role failed: The role type does not have this permission.', async () => {
            const permission = await rolePermissionTestHelper.createPermission({ groups: 'Labor' });

            return testHelper
                .post(`/roles`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: faker.random.words(20),
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    assignedPermissionIds: [permission.id]
                })
                .isValidateError()
                .has(['errors'])
                .then(({ body }) => {
                    validateRolePermissionError(body);
                });
        });

        it('Create role failed: Invalid date format.', async () => {
            const permission = await rolePermissionTestHelper.createPermission();

            return testHelper
                .post(`/roles`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: faker.random.words(20),
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: true,
                    seasonStartDate: '31/13/2023',
                    seasonDuration: 12,
                    assignedPermissionIds: [permission.id]
                })
                .isValidateError()
                .has(['errors["seasonStartDate"]'])
                .then(({ body }) => {
                    validateSeasonStartDateFormatError(body);
                });
        });
    });

    const validateSubPermissionError = (body) => {
        assert.strictEqual(body.message, 'Validate Exception');
        const messageMetadata = _.get(body, 'errors["assignedPermissionIds[0]"].messages[0]');
        assert.strictEqual(messageMetadata, 'The permission can only have one sub permission.');
    };

    const validateRolePermissionError = (body) => {
        assert.strictEqual(body.message, 'Validate Exception');
        const messageMetadata = _.get(body, 'errors["assignedPermissionIds[0]"].messages[0]');
        assert.strictEqual(messageMetadata, 'The role type does not have this permission.');
    };

    const validateChainOfCustodyError = (body) => {
        assert.strictEqual(body.message, 'Validate Exception');
        const messageMetadata = _.get(body, 'errors.chainOfCustody.messages[0]');
        assert.strictEqual(messageMetadata, 'Chain Of Custody must be a valid enum value');
    };

    const validatePermissionWithoutParentError = (body) => {
        assert.strictEqual(body.message, 'Validate Exception');
        const messageMetadata = _.get(body, 'errors["assignedPermissionIds[0]"].messages[0]');
        assert.strictEqual(messageMetadata, 'The permission is assigned without parent permission.');
    };

    const validateSeasonStartDateFormatError = (body) => {
        assert.strictEqual(body.message, 'Validate Exception');
        const messageMetadata = _.get(body, 'errors.seasonStartDate.messages[0]');
        assert.strictEqual(messageMetadata, 'Season Start Date must be in format of DD/MM/YYYY.');
    };

    describe('Super Admin edit a role', () => {
        it('Edit role successfully', async () => {
            const permission = await rolePermissionTestHelper.createPermission({ groups: RoleTypeEnum.PRODUCT });

            return testHelper
                .put(`/roles/${newRole.id}`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: 'New Role',
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    assignedPermissionIds: [permission.id]
                })
                .isNoContent()
                .then(async () => {
                    await testHelper.visibleInDatabase(RoleEntity, {
                        id: newRole.id,
                        name: 'New Role'
                    });

                    await testHelper.visibleInDatabase(RoleHasPermissionEntity, {
                        roleId: newRole.id,
                        permissionId: permission.id
                    });
                });
        });

        it('Edit role failed: The name has already been taken.', async () => {
            const permission = await rolePermissionTestHelper.createPermission({ groups: RoleTypeEnum.PRODUCT });

            return testHelper
                .put(`/roles/${newRole.id}`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: 'ADMIN',
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    assignedPermissionIds: [permission.id]
                })
                .isValidateError()
                .then(validateErrorCallback);
        });

        it('Edit role failed: The permission is assigned without parent permission.', async () => {
            const permission = await rolePermissionTestHelper.createPermission({ groups: RoleTypeEnum.PRODUCT });
            const subPermission = await rolePermissionTestHelper.createPermission({
                parentId: permission.id,
                groups: RoleTypeEnum.PRODUCT
            });

            return testHelper
                .put(`/roles/${newRole.id}`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: newRole.name,
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    assignedPermissionIds: [subPermission.id]
                })
                .isValidateError()
                .has(['errors'])
                .then(({ body }) => {
                    validatePermissionWithoutParentError(body);
                });
        });

        it('Edit role failed: Chain Of Custody must be a valid enum value', async () => {
            const permission = await rolePermissionTestHelper.createPermission();

            return testHelper
                .put(`/roles/${newRole.id}`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: newRole.name,
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: 'Abc',
                    assignedPermissionIds: [permission.id]
                })
                .isValidateError()
                .has(['errors["chainOfCustody"]'])
                .then(({ body }) => {
                    validateChainOfCustodyError(body);
                });
        });

        it('Edit role failed: The permission can only have one sub permission.', async () => {
            const permission = await rolePermissionTestHelper.createPermission({
                groupType: GroupTypeEnum.RADIO_GROUP,
                groups: RoleTypeEnum.PRODUCT
            });
            const subPermission = await rolePermissionTestHelper.createPermission({
                parentId: permission.id,
                groups: RoleTypeEnum.PRODUCT
            });
            const subPermission2 = await rolePermissionTestHelper.createPermission({
                parentId: permission.id,
                groups: RoleTypeEnum.PRODUCT
            });

            return testHelper
                .put(`/roles/${newRole.id}`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: newRole.name,
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    assignedPermissionIds: [permission.id, subPermission.id, subPermission2.id]
                })
                .isValidateError()
                .has(['errors'])
                .then(({ body }) => {
                    validateSubPermissionError(body);
                });
        });

        it('Edit role failed: The role type does not have this permission.', async () => {
            const permission = await rolePermissionTestHelper.createPermission({ groups: RoleTypeEnum.LABOR });

            return testHelper
                .put(`/roles/${newRole.id}`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: newRole.name,
                    type: RoleTypeEnum.PRODUCT,
                    isRawMaterialExtractor: false,
                    chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE,
                    assignedPermissionIds: [permission.id]
                })
                .isValidateError()
                .has(['errors'])
                .then(({ body }) => {
                    validateRolePermissionError(body);
                });
        });
    });

    describe('Super Admin delete a role', () => {
        it('Delete role by id successfully', async () => {
            const role = await rolePermissionTestHelper.createRole();

            await testHelper
                .delete(`/roles/${role.id}`)
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isNoContent()
                .then(async () => {
                    await testHelper.invisibleInDatabase(RoleEntity, {
                        id: role.id
                    });

                    await testHelper.invisibleInDatabase(RoleHasPermissionEntity, {
                        roleId: role.id
                    });
                });
        });
    });

    const validateErrorCallback = ({ body }) => {
        assert.strictEqual(body.message, 'Validate Exception');
        const message = _.get(body, 'errors.name.messages[0]');
        assert.strictEqual(message, 'The name has already been taken.');
    };

    describe('Super Admin validates a role', () => {
        it('Super Admin validates successfully when creating a role', async () => {
            return testHelper
                .post('/roles/validate-roles')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: faker.random.words(20)
                })
                .isOk();
        });

        it('Super Admin validates unsuccessfully when creating a role', async () => {
            const role = await rolePermissionTestHelper.createRole({ name: 'CreatedRole' });

            return testHelper
                .post('/roles/validate-roles')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    name: role.name
                })
                .isValidateError()
                .then(validateErrorCallback);
        });

        it('Super Admin validates successfully when editing a role', async () => {
            const role = await rolePermissionTestHelper.createRole({ name: 'EditedRole' });

            return testHelper
                .post('/roles/validate-roles')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    id: role.id,
                    name: role.name
                })
                .isOk();
        });

        it('Super Admin validates unsuccessfully when editing a role', async () => {
            const role = await rolePermissionTestHelper.createRole({ name: 'EditedRole' });
            const role2 = await rolePermissionTestHelper.createRole({ name: 'ExistedRole' });

            return testHelper
                .post('/roles/validate-roles')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .send({
                    id: role.id,
                    name: role2.name
                })
                .isValidateError()
                .then(validateErrorCallback);
        });
    });
});
