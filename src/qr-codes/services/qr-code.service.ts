import { TransactionService } from '@diginexhk/nestjs-transaction';
import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { countBy, map } from 'lodash';
import { In, Not } from 'typeorm';
import { ProductEntity } from '~products/entities/product.entity';
import { MAX_QR_CODE_VALUE } from '~qr-codes/constants/generate-qr-code.constant';
import { QrCodeBatchEntity } from '~qr-codes/entities/qr-code-batch.entity';
import { QrCodeEntity } from '~qr-codes/entities/qr-code.entity';
import { QrCodeStatusEnum } from '~qr-codes/enums/qr-code-status.enum';
import { QrCodeBatchRepository } from '~qr-codes/repositories/qr-code-batch.repository';
import { QrCodeRepository } from '~qr-codes/repositories/qr-code.repository';

@Injectable()
export class QrCodeService extends TransactionService {
    constructor(private qrCodeBatchRepo: QrCodeBatchRepository, private qrCodeRepo: QrCodeRepository) {
        super();
    }

    async createQrCodesInBatch(qrCodeBatch: QrCodeBatchEntity, quantity: number): Promise<QrCodeEntity[]> {
        const qrCodes: QrCodeEntity[] = [];

        for (let i = 0; i < quantity; i++) {
            qrCodes.push(
                this.qrCodeRepo.create({
                    code: await this.generateQrCode(),
                    status: QrCodeStatusEnum.ENCODED,
                    qrCodeBatch
                })
            );
        }

        return this.qrCodeRepo.save(qrCodes);
    }

    async generateQrCode() {
        const code = String(randomInt(MAX_QR_CODE_VALUE)).padStart(9, '0');

        const isExists = await this.qrCodeRepo.exists({ code });
        if (isExists) {
            return this.generateQrCode();
        }

        return code;
    }

    getEncodedQrCode(code: string) {
        return this.qrCodeRepo.findOneByOrFail({ code, status: QrCodeStatusEnum.ENCODED });
    }

    async assignProduct(code: string, product: ProductEntity) {
        const qrCode = await this.getEncodedQrCode(code);
        await this.qrCodeRepo.updateOrFail({ id: qrCode.id }, { product, status: QrCodeStatusEnum.ACTIVE });

        await this.qrCodeBatchRepo.updateTotalActive(qrCode.qrCodeBatchId, 1);
    }

    async dispenseQrCode(productIds: string[]) {
        const qrCodes = await this.qrCodeRepo.findBy({ productId: In(productIds) });

        const qrCodeIds = map(qrCodes, 'id');
        await this.qrCodeRepo.dispenseQrCodes(qrCodeIds);

        const updatedQrCodes = qrCodes.filter(({ status }) => status !== QrCodeStatusEnum.DISPENSED);
        const qrCodeBatchs = countBy(updatedQrCodes, ({ qrCodeBatchId }) => qrCodeBatchId);
        for (const [qrCodeBatchId, count] of Object.entries(qrCodeBatchs)) {
            await this.qrCodeBatchRepo.updateTotalDispensed(qrCodeBatchId, count);
        }

        await this.qrCodeBatchRepo.checkCompleteQrCodeBatch(Object.keys(qrCodeBatchs));
    }

    getAssignedQrCode(code: string) {
        return this.qrCodeRepo.findOneBy({ code, status: Not(QrCodeStatusEnum.ENCODED) });
    }

    async getAvailableQrCodes() {
        return (await this.qrCodeRepo.getAvailableQrCodes()).map(({ code }) => code);
    }

    async getQRCodeByCode(code: string) {
        return this.qrCodeRepo.getQRCodeByCode(code);
    }
}
