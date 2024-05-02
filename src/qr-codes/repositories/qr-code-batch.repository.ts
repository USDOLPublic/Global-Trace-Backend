import { CustomRepository } from '@diginexhk/typeorm-helper';
import moment from 'moment';
import { BaseRepository } from '~core/repositories/base.repository';
import { QrCodeBatchEntity } from '../entities/qr-code-batch.entity';

@CustomRepository(QrCodeBatchEntity)
export class QrCodeBatchRepository extends BaseRepository<QrCodeBatchEntity> {
    async updateTotalActive(id: string, value: number) {
        await this.createQueryBuilder()
            .update(QrCodeBatchEntity)
            .set({
                totalActive: () => `"totalActive" + ${value}`,
                totalEncoded: () => `"totalEncoded" - ${value}`
            })
            .where({ id })
            .execute();
    }

    async updateTotalDispensed(id: string, value: number) {
        await this.createQueryBuilder()
            .update(QrCodeBatchEntity)
            .set({
                totalDispensed: () => `"totalDispensed" + ${value}`,
                totalActive: () => `"totalActive" - ${value}`
            })
            .where({ id })
            .execute();
    }

    async checkCompleteQrCodeBatch(ids: string[]) {
        await this.createQueryBuilder()
            .update(QrCodeBatchEntity)
            .set({ completedAt: moment().toDate() })
            .whereInIds(ids)
            .andWhere('totalDispensed = quantity')
            .execute();
    }
}
