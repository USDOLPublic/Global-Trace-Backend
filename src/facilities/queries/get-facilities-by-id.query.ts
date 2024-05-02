import { In, SelectQueryBuilder } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { GetFacilityWithLocationRelationsBaseQuery } from './get-facility-with-location-relations-base.query';

export class GetFacilitiesByIdQuery extends GetFacilityWithLocationRelationsBaseQuery {
    constructor(private facilityIds: string[]) {
        super();
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        super.query(query);
        query.withDeleted();
        query.leftJoinAndSelect('Facility.users', 'User');
        query.leftJoinAndSelect('Facility.type', 'Role');
        query.where({ id: In(this.facilityIds) });
    }
}
