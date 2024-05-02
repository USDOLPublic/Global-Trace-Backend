import { TestHelper } from '~core/tests/test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('PermissionController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let superAdmin: UserEntity;

    beforeAll(async () => {
        await testHelper.initialize();
        superAdmin = await userTestHelper.createUser({}, UserRoleEnum.SUPER_ADMIN);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    describe('Super Admin gets all permissions', () => {
        it('Super Admin gets all permissions successfully', async () => {
            return testHelper
                .get('/permissions')
                .authenticate(await userTestHelper.getToken(superAdmin))
                .isOk();
        });
    });
});
