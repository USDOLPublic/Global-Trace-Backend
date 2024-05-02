import faker from 'faker';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { QrCodeRepository } from '~qr-codes/repositories/qr-code.repository';
import { ChainOfCustodyEnum } from '~role-permissions/enums/chain-of-custody.enum';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('QrCodeController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    let ginner: UserEntity;
    let ginnerToken: string;

    beforeAll(async () => {
        await testHelper.initialize();
        ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerToken = await userTestHelper.getToken(ginner);
        await facilityTestHelper.create(ginner, UserRoleEnum.GINNER, {
            chainOfCustody: ChainOfCustodyEnum.MASS_BALANCE
        });

        await userTestHelper.assignPermission(ginner.id, PermissionEnum.GENERATE_QR_CODES);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Ginner checks an invalid QR code', () => {
        return testHelper
            .get(`/qr-codes/${faker.random.alphaNumeric(9)}`)
            .authenticate(ginnerToken)
            .isNotFound();
    });

    it('Ginner checks an valid QR code', async () => {
        const admin = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);
        const adminToken = await userTestHelper.getToken(admin);

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

        const { code } = await QrCodeRepository.make().findOneByOrFail({ qrCodeBatchId });

        return testHelper.get(`/qr-codes/${code}`).authenticate(ginnerToken).isOk();
    });

    it('Ginner gets list of available QR codes', async () => {
        const codes = (await QrCodeRepository.make().getAvailableQrCodes()).map(({ code }) => code);
        return testHelper
            .get('/qr-codes')
            .authenticate(ginnerToken)
            .isOk()
            .then(({ body }) => {
                expect(body).toEqual(codes);
            });
    });
});
