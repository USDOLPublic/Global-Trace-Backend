import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { QrCodeStatusEnum } from '~qr-codes/enums/qr-code-status.enum';
import { QrCodeEntity } from '../entities/qr-code.entity';

@CustomRepository(QrCodeEntity)
export class QrCodeRepository extends BaseRepository<QrCodeEntity> {
    async dispenseQrCodes(ids: string[]) {
        await this.createQueryBuilder()
            .update(QrCodeEntity)
            .set({ status: QrCodeStatusEnum.DISPENSED })
            .whereInIds(ids)
            .execute();
    }

    getAvailableQrCodes(): Promise<{ code: string }[]> {
        return this.createQueryBuilder('QrCode')
            .where({ status: QrCodeStatusEnum.ENCODED })
            .select('code', 'code')
            .getRawMany();
    }

    getQRCodeByCode(code: string): Promise<QrCodeEntity> {
        return this.createQueryBuilder('QrCode').withDeleted().where({ code }).getOne();
    }
}
