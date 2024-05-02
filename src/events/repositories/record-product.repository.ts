import { BaseRepository } from '~core/repositories/base.repository';
import { RecordProductEntity } from '../entities/record-product.entity';
import { TimeRangeType } from '~events/types/time-range.type';
import { CustomRepository } from '@diginexhk/typeorm-helper';

@CustomRepository(RecordProductEntity)
export class RecordProductRepository extends BaseRepository<RecordProductEntity> {
    getRecordByProduct(facilityId: string, timeRange: TimeRangeType<Date>) {
        const query = this.createQueryBuilder('RecordProduct')
            .innerJoinAndSelect('RecordProduct.facility', 'facility')
            .where({ facilityId: facilityId });

        if (timeRange.from) {
            query.andWhere('RecordProduct.recordedAt >= :from', { from: timeRange.from });
        }
        if (timeRange.to) {
            query.andWhere('RecordProduct.recordedAt <= :to', { to: timeRange.to });
        }

        return query.getMany();
    }

    getRecordProductById(id: string) {
        return this.createQueryBuilder('RecordProduct')
            .where({ id })
            .select(['"id"', '"facilityId"', '"uploadProofs"', '"totalWeight"', '"weightUnit"'])
            .getRawOne();
    }
}
