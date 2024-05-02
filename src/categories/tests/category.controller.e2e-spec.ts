import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import { TestHelper } from '~core/tests/test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('CategoryController (e2e)', () => {
    const testHelper = new TestHelper();
    const userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let admin: UserEntity;
    let token: string;

    beforeAll(async () => {
        await testHelper.initialize();

        admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        token = await userTestHelper.getToken(admin);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Get all indicators', async () => {
        return testHelper.get(`/categories/all?type=${CategoryTypeEnum.INDICATOR}`).authenticate(token).isOk();
    });
});
