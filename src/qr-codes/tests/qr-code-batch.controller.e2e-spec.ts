import assert from 'assert';
import faker from 'faker';
import moment from 'moment';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { QrCodeBatchEntity } from '~qr-codes/entities/qr-code-batch.entity';
import { QrCodeStatusEnum } from '~qr-codes/enums/qr-code-status.enum';
import { QrCodeBatchRepository } from '~qr-codes/repositories/qr-code-batch.repository';
import { QrCodeRepository } from '~qr-codes/repositories/qr-code.repository';
import { QrCodeTestHelper } from '~qr-codes/tests/qr-code-test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('QrCodeBatchController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let qrCodeTestHelper = testHelper.getTestHelperModule(QrCodeTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    let admin;
    let adminToken;

    beforeAll(async () => {
        await testHelper.initialize();
        admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        adminToken = await userTestHelper.getToken(admin);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Admin generates QR codes successfully', () => {
        const name = faker.random.words(3);
        const quantity = faker.datatype.number({ min: 5, max: 15 });
        return testHelper
            .post('/qr-code-batchs')
            .authenticate(adminToken)
            .send({ name, quantity })
            .isCreated()
            .then(async ({ body }) => {
                expect(body).toMatchObject({
                    name,
                    quantity,
                    totalEncoded: quantity,
                    totalActive: 0,
                    totalDispensed: 0,
                    creatorId: admin.id
                });

                const qrCodeBatchId = body.id;
                const count = await QrCodeRepository.make().count({ where: { qrCodeBatchId } });
                expect(count).toEqual(quantity);
            });
    });

    it('Admin generates QR codes - validation failed', () => {
        const quantity = faker.datatype.number({ min: 5, max: 15 });
        return testHelper.post('/qr-code-batchs').authenticate(adminToken).send({ quantity }).isValidateError();
    });

    it('Spinner can not generate QR codes', async () => {
        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        const spinnerToken = await userTestHelper.getToken(spinner);
        await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);

        const name = faker.random.words(3);
        const quantity = faker.datatype.number({ min: 5, max: 15 });
        return testHelper
            .post('/qr-code-batchs')
            .authenticate(spinnerToken)
            .send({ name, quantity })
            .isForbiddenError();
    });

    it('Admin gets list of QR code batch', () => {
        return testHelper
            .get('/qr-code-batchs')
            .authenticate(adminToken)
            .isOk()
            .isPagination()
            .then(({ body }) => {
                expect(body).toMatchObject({
                    total: 1,
                    currentPage: 1
                });
                expect(body).toHaveProperty('items');
                expect(body.items).toHaveLength(1);
            });
    });

    it('Admin add new QR code failed valid', async () => {
        const name = faker.random.words(3);
        const quantity = 1100;

        await testHelper
            .post('/qr-code-batchs')
            .authenticate(adminToken)
            .send({ name, quantity })
            .isValidateError()
            .then(({ body }) => {
                assert.strictEqual(body.message, 'Validate Exception');
                assert.strictEqual(body.errors.quantity.messages[0], 'Quantity must not be greater than 1000');
            });
    });

    it('Admin views history', async () => {
        const name = faker.random.words(3);
        const quantity = faker.datatype.number({ min: 5, max: 15 });
        let qrCodeBatchId: string;
        await testHelper
            .post('/qr-code-batchs')
            .authenticate(adminToken)
            .send({ name, quantity })
            .isCreated()
            .then(({ body }) => {
                qrCodeBatchId = body.id;
            });

        await QrCodeBatchRepository.make().update({ id: qrCodeBatchId }, { completedAt: moment().toDate() });

        return testHelper
            .get('/qr-code-batchs/history')
            .authenticate(adminToken)
            .isOk()
            .isPagination()
            .then(({ body }) => {
                expect(body).toMatchObject({
                    total: 1,
                    currentPage: 1
                });
                expect(body).toHaveProperty('items');
                expect(body.items).toHaveLength(1);
                expect(body.items[0]).toMatchObject({
                    id: qrCodeBatchId,
                    name,
                    quantity,
                    creatorId: admin.id
                });
            });
    });

    it('Delete QR code successfully', async () => {
        admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        adminToken = await userTestHelper.getToken(admin);
        const qrCodeBatch = await qrCodeTestHelper.createQrCodeBatch(admin);
        await qrCodeTestHelper.createQrCode(qrCodeBatch, { status: QrCodeStatusEnum.ACTIVE });
        return testHelper
            .delete(`/qr-code-batchs/${qrCodeBatch.id}`)
            .authenticate(adminToken)
            .isNoContent()
            .then(async () => {
                await testHelper.invisibleInDatabase(QrCodeBatchEntity, { id: qrCodeBatch.id });
            });
    });

    it('Delete QR code fail', async () => {
        admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        adminToken = await userTestHelper.getToken(admin);
        const qrCodeBatch = await qrCodeTestHelper.createQrCodeBatch(admin, { completedAt: null });
        await qrCodeTestHelper.createQrCode(qrCodeBatch, { status: QrCodeStatusEnum.ACTIVE });
        return testHelper
            .delete(`/qr-code-batchs/${qrCodeBatch.id}`)
            .authenticate(adminToken)
            .isBadRequestError()
            .then(async () => {
                await testHelper.visibleInDatabase(QrCodeBatchEntity, { id: qrCodeBatch.id });
            });
    });

    it('Delete all QR code successfully', async () => {
        admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        adminToken = await userTestHelper.getToken(admin);
        const qrCodeBatch = await qrCodeTestHelper.createQrCodeBatch(admin);
        await qrCodeTestHelper.createQrCode(qrCodeBatch, { status: QrCodeStatusEnum.ACTIVE });
        return testHelper
            .delete(`/qr-code-batchs`)
            .authenticate(adminToken)
            .isNoContent()
            .then(async () => {
                await testHelper.invisibleInDatabase(QrCodeBatchEntity, { id: qrCodeBatch.id });
            });
    });

    it('Delete all QR code failed', async () => {
        admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        adminToken = await userTestHelper.getToken(admin);
        const qrCodeBatch = await qrCodeTestHelper.createQrCodeBatch(admin, { completedAt: null });
        await qrCodeTestHelper.createQrCode(qrCodeBatch, { status: QrCodeStatusEnum.ACTIVE });
        return testHelper
            .delete(`/qr-code-batchs`)
            .authenticate(adminToken)
            .isNoContent()
            .then(async () => {
                await testHelper.visibleInDatabase(QrCodeBatchEntity, { id: qrCodeBatch.id });
            });
    });
});
