import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export class GetFacilityWithLocationRelationsBaseQuery extends BaseQuery<FacilityEntity> {
    constructor() {
        super();
    }

    alias(): string {
        return 'Facility';
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        query
            .leftJoinAndSelect('Facility.country', 'Country')
            .leftJoinAndSelect('Facility.province', 'Province')
            .leftJoinAndSelect('Facility.district', 'District');
    }
}
