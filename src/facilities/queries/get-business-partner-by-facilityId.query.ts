import { SelectQueryBuilder } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { GetFarmAndFarmGroupBaseQuery } from '~facilities/queries/get-farm-and-farm-group-base.query';

export class GetBusinessPartnersByFacilityIdQuery extends GetFarmAndFarmGroupBaseQuery {
    constructor(private facilityId: string) {
        super();
    }

    alias(): string {
        return 'Facility';
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        super.query(query);
        query
            .leftJoinAndSelect(`${this.alias()}.users`, 'User')
            .leftJoinAndSelect('User.role', 'UserRole')
            .innerJoin(`${this.alias()}.partnerFacilities`, 'partnerFacilities')
            .where('partnerFacilities.facilityId = :facilityId', { facilityId: this.facilityId })
            .andWhere('partnerFacilities.ownerFacilityId = :facilityId', { facilityId: this.facilityId });
    }
}
