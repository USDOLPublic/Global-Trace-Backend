import { BaseQuery } from '@diginexhk/typeorm-helper';
import moment from 'moment';
import { LessThanOrEqual, MoreThanOrEqual, SelectQueryBuilder, In } from 'typeorm';
import { TimeRangeType } from '~events/types/time-range.type';
import { EventEntity } from '~history/entities/event.entity';
import { EventTypeEnum } from '~history/enums/event-type.enum';

export class GetEventsQuery extends BaseQuery<EventEntity> {
    constructor(
        protected facilityId: string,
        protected timeRange: TimeRangeType<number>,
        protected types: EventTypeEnum[] = []
    ) {
        super();
    }

    alias(): string {
        return 'Event';
    }

    get eventTypes(): EventTypeEnum[] | undefined {
        return this.types;
    }

    query(query: SelectQueryBuilder<EventEntity>) {
        query.where({ facilityId: this.facilityId });

        if (this.timeRange.from) {
            query.andWhere({ recordedAt: MoreThanOrEqual(moment.unix(this.timeRange.from).toDate()) });
        }

        if (this.timeRange.to) {
            query.andWhere({ recordedAt: LessThanOrEqual(moment.unix(this.timeRange.to).toDate()) });
        }

        if (this.eventTypes.length) {
            query.andWhere({ type: In(this.eventTypes) });
        }
    }

    order(query: SelectQueryBuilder<EventEntity>) {
        query.addOrderBy(`${this.alias()}.recordedAt`, 'DESC');
    }
}
