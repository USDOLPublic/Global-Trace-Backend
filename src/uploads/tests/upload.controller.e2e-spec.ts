import { TestHelper } from '~core/tests/test.helper';
import { readFileSync } from 'fs';
import { env } from '~config/env.config';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';
import path from 'path';

describe('UploadController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let user: UserEntity;
    let userToken: string;

    beforeAll(async () => {
        await testHelper.initialize();

        user = await userTestHelper.createUser({});
        userToken = await userTestHelper.getToken(user);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Upload files successfully', () => {
        return testHelper
            .post('/upload/files')
            .authenticate(userToken)
            .type('form')
            .attach(
                'files',
                readFileSync(path.join(env.ROOT_PATH, 'core/tests/assets/dev-test-image.png')),
                'dev-test-image.png'
            )
            .isCreated()
            .then(({ body }) => {
                expect(body).toHaveLength(1);
                expect(body[0]).toHaveProperty('blobName');
                expect(body[0]).toHaveProperty('url');
            });
    });
});
