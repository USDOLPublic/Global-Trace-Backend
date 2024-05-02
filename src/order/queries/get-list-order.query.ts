import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { OrderEntity } from '~order/entities/order.entity';

export class GetListOrderQuery extends BaseQuery<OrderEntity> {
    constructor(private currentFacilityId: string, private sortParams: SortMultipleParams[]) {
        super();
    }

    alias(): string {
        return 'Order';
    }

    query(query: SelectQueryBuilder<OrderEntity>) {
        query.innerJoinAndSelect(`${this.alias()}.supplier`, 'supplier');
        query.where({ facilityId: this.currentFacilityId });
    }

    order(query: SelectQueryBuilder<OrderEntity>) {
        for (const sortParam of this.sortParams) {
            query.addOrderBy(`${this.alias()}.${sortParam.field}`, sortParam.direction);
        }
    }
}
