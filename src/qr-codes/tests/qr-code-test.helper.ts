import { TestHelper } from '~core/tests/test.helper';
import faker from 'faker';
import { UserEntity } from '~users/entities/user.entity';
import { QrCodeEntity } from '~qr-codes/entities/qr-code.entity';
import { QrCodeRepository } from '~qr-codes/repositories/qr-code.repository';
import { QrCodeBatchRepository } from '~qr-codes/repositories/qr-code-batch.repository';
import { QrCodeBatchEntity } from '~qr-codes/entities/qr-code-batch.entity';
import { MAX_QR_CODE_VALUE } from '~qr-codes/constants/generate-qr-code.constant';
import { randomInt } from 'crypto';

export class QrCodeTestHelper {
    constructor(private testHelper: TestHelper) {}

    createQrCodeBatch(user: UserEntity, options: Partial<QrCodeBatchEntity> = {}) {
        const quantity = faker.datatype.number({ min: 5, max: 15 });
        return QrCodeBatchRepository.make().save({
            name: faker.random.words(3),
            quantity,
            totalEncoded: quantity,
            creatorId: user.id,
            completedAt: faker.datatype.datetime(),
            ...options
        });
    }

    createQrCode(qrCodeBatch: QrCodeBatchEntity, options: Partial<QrCodeEntity> = {}) {
        return QrCodeRepository.make().save({
            qrCodeBatchId: qrCodeBatch.id,
            code: String(randomInt(MAX_QR_CODE_VALUE)).padStart(9, '0'),
            ...options
        });
    }
}
