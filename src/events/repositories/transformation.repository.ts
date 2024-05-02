import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { TransformationEntity } from '~events/entities/transformation.entity';
import { TimeRangeType } from '~events/types/time-range.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';

@CustomRepository(TransformationEntity)
export class TransformationRepository extends BaseRepository<TransformationEntity> {
    get alias(): string {
        return 'Transformation';
    }

    async getTotalAssignProductByTime(facilityId: string, timeRange: TimeRangeType<Date>) {
        const query = this.createQueryBuilder(this.alias)
            .innerJoinAndSelect(`${this.alias}.transformationItems`, 'transformationItems')
            .innerJoinAndSelect('transformationItems.product', 'product')
            .where({ facilityId: facilityId })
            .andWhere('transformationItems.isInput = false');

        if (timeRange.from) {
            query.andWhere(`${this.alias}.createdAt >= :from`, { from: timeRange.from });
        }
        if (timeRange.to) {
            query.andWhere(`${this.alias}.createdAt <= :to`, { to: timeRange.to });
        }

        return query.getMany();
    }

    getTransformationFromOutput(facility: FacilityEntity, entityIds: string[]) {
        return this.createQueryBuilder(this.alias)
            .innerJoin(
                'TransformationItem',
                'transformationItem',
                `${this.alias}.id = transformationItem.transformationId`
            )
            .where({ facilityId: facility.id })
            .andWhere('transformationItem.entityId IN (:...entityIds)', { entityIds })
            .andWhere('transformationItem.isInput = false')
            .getMany();
    }
}
