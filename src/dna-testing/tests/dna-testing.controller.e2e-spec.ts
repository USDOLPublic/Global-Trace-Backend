import faker from 'faker';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { env } from '~config/env.config';
import { TestHelper } from '~core/tests/test.helper';
import { DnaTestingEntity } from '~dna-testing/entities/dna-testing.entity';
import { StatusDnaTestingEnum } from '~dna-testing/enums/status-dna-testing.enum';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { ProductTestHelper } from '~products/tests/product-test.helper';
import { QrCodeStatusEnum } from '~qr-codes/enums/qr-code-status.enum';
import { QrCodeTestHelper } from '~qr-codes/tests/qr-code-test.helper';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserEntity } from '~users/entities/user.entity';
import { UserTestHelper } from '~users/tests/user-test.helper';

const testHelper = new TestHelper();
const userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
const facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
const qrCodeTestHelper = testHelper.getTestHelperModule(QrCodeTestHelper);
const productTestHelper = testHelper.getTestHelperModule(ProductTestHelper);

let adminUser: UserEntity;
let ginnerFacility: FacilityEntity;

beforeAll(async () => {
    await testHelper.initialize();

    adminUser = await userTestHelper.createUser({}, UserRoleEnum.ADMIN);

    const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
    ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);
});

afterAll(async () => {
    await testHelper.close();
});

it('Test result is passed when DNA identifiers detected is yes', async () => {
    const product = await productTestHelper.createProduct({
        dnaIdentifier: 'Test01',
        code: null,
        createdFacilityId: ginnerFacility.id
    });
    const qrCodeBatch = await qrCodeTestHelper.createQrCodeBatch(adminUser);
    const qrCode = await qrCodeTestHelper.createQrCode(qrCodeBatch, { status: QrCodeStatusEnum.ACTIVE, product });

    return testHelper
        .post('/dna-testings')
        .authenticate(await userTestHelper.getToken(adminUser))
        .type('form')
        .field('requestFacilityId', ginnerFacility.id)
        .field('productId', qrCode.code)
        .field('productSupplierId', ginnerFacility.id)
        .field('isDetected', true)
        .field('dnaIdentifiers', product.dnaIdentifier)
        .field('testedAt', moment().unix())
        .attach(
            'uploadProofs',
            fs.readFileSync(path.join(env.ROOT_PATH, 'core/tests/assets/dev-test-image.png')),
            'dev-test-image.png'
        )
        .isCreated()
        .then(async () => {
            await testHelper.visibleInDatabase(DnaTestingEntity, {
                requestFacilityId: ginnerFacility.id,
                dnaIdentifiers: [product.dnaIdentifier],
                productId: qrCode.code,
                status: StatusDnaTestingEnum.PASSED
            });
        });
});

it('Test result is passed when DNA identifiers detected is yes', async () => {
    const product = await productTestHelper.createProduct({
        dnaIdentifier: 'Test01',
        code: 'ABC01',
        createdFacilityId: ginnerFacility.id
    });

    return testHelper
        .post('/dna-testings')
        .authenticate(await userTestHelper.getToken(adminUser))
        .type('form')
        .field('requestFacilityId', ginnerFacility.id)
        .field('productId', product.code)
        .field('productSupplierId', ginnerFacility.id)
        .field('isDetected', true)
        .field('dnaIdentifiers', product.dnaIdentifier)
        .field('testedAt', moment().unix())
        .attach(
            'uploadProofs',
            fs.readFileSync(path.join(env.ROOT_PATH, 'core/tests/assets/dev-test-image.png')),
            'dev-test-image.png'
        )
        .isCreated()
        .then(async () => {
            await testHelper.visibleInDatabase(DnaTestingEntity, {
                requestFacilityId: ginnerFacility.id,
                dnaIdentifiers: [product.dnaIdentifier],
                productId: product.code,
                status: StatusDnaTestingEnum.PASSED
            });
        });
});

it('Test result is failed when DNA identifiers detected is yes', async () => {
    const product = await productTestHelper.createProduct({
        dnaIdentifier: 'Test01',
        code: 'ABC01',
        createdFacilityId: ginnerFacility.id
    });
    const productId = faker.random.alphaNumeric(10);
    return testHelper
        .post('/dna-testings')
        .authenticate(await userTestHelper.getToken(adminUser))
        .type('form')
        .field('requestFacilityId', ginnerFacility.id)
        .field('productId', productId)
        .field('productSupplierId', ginnerFacility.id)
        .field('isDetected', true)
        .field('dnaIdentifiers', product.dnaIdentifier)
        .field('testedAt', moment().unix())
        .attach(
            'uploadProofs',
            fs.readFileSync(path.join(env.ROOT_PATH, 'core/tests/assets/dev-test-image.png')),
            'dev-test-image.png'
        )
        .isCreated()
        .then(async () => {
            await testHelper.visibleInDatabase(DnaTestingEntity, {
                requestFacilityId: ginnerFacility.id,
                dnaIdentifiers: [product.dnaIdentifier],
                productId,
                status: StatusDnaTestingEnum.FAILED
            });
        });
});

it('Test result is passed when DNA identifiers detected is no', async () => {
    const product = await productTestHelper.createProduct({
        code: 'ABC01',
        createdFacilityId: ginnerFacility.id
    });

    return testHelper
        .post('/dna-testings')
        .authenticate(await userTestHelper.getToken(adminUser))
        .type('form')
        .field('requestFacilityId', ginnerFacility.id)
        .field('productId', product.code)
        .field('productSupplierId', ginnerFacility.id)
        .field('isDetected', false)
        .field('testedAt', moment().unix())
        .attach(
            'uploadProofs',
            fs.readFileSync(path.join(env.ROOT_PATH, 'core/tests/assets/dev-test-image.png')),
            'dev-test-image.png'
        )
        .isCreated()
        .then(async () => {
            await testHelper.visibleInDatabase(DnaTestingEntity, {
                requestFacilityId: ginnerFacility.id,
                dnaIdentifiers: [],
                productId: product.code,
                status: StatusDnaTestingEnum.PASSED
            });
        });
});

it('Test result is failed when DNA identifiers detected is no', async () => {
    const product = await productTestHelper.createProduct({
        dnaIdentifier: 'Test01',
        code: 'ABC01',
        createdFacilityId: ginnerFacility.id
    });

    return testHelper
        .post('/dna-testings')
        .authenticate(await userTestHelper.getToken(adminUser))
        .type('form')
        .field('requestFacilityId', ginnerFacility.id)
        .field('productId', product.code)
        .field('productSupplierId', ginnerFacility.id)
        .field('isDetected', false)
        .field('testedAt', moment().unix())
        .attach(
            'uploadProofs',
            fs.readFileSync(path.join(env.ROOT_PATH, 'core/tests/assets/dev-test-image.png')),
            'dev-test-image.png'
        )
        .isCreated()
        .then(async () => {
            await testHelper.visibleInDatabase(DnaTestingEntity, {
                requestFacilityId: ginnerFacility.id,
                dnaIdentifiers: [],
                productId: product.code,
                status: StatusDnaTestingEnum.FAILED
            });
        });
});

it('Get list Dna testing', async () => {
    return testHelper
        .get('/dna-testings')
        .authenticate(await userTestHelper.getToken(adminUser))
        .isOk()
        .isPagination();
});
