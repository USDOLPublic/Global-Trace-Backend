import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export class GetFarmAndFarmGroupBaseQuery extends BaseQuery<FacilityEntity> {
    alias(): string {
        return 'Facility';
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        query.leftJoinAndSelect(`${this.alias()}.type`, 'Role');
    }
}
