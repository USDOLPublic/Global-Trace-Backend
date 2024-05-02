import { SelectQueryBuilder } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { GetFacilityWithLocationRelationsBaseQuery } from './get-facility-with-location-relations-base.query';

export class GetBrandSuppliersQuery extends GetFacilityWithLocationRelationsBaseQuery {
    constructor(private ownerFacilityId: string) {
        super();
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        super.query(query);
        query
            .innerJoin('Facility.partnerFacilities', 'PartnerFacility')
            .leftJoinAndSelect('Facility.users', 'User')
            .leftJoinAndSelect('Facility.type', 'Role')
            .leftJoinAndSelect(
                'Facility.facilityPartners',
                'facilityPartners',
                'facilityPartners.ownerFacilityId = :ownerFacilityId',
                { ownerFacilityId: this.ownerFacilityId }
            )
            .leftJoinAndSelect(
                'Facility.partnerFacilities',
                'partnerFacilities',
                '"partnerFacilities"."ownerFacilityId" = :ownerFacilityId AND "partnerFacilities"."facilityId" != :ownerFacilityId',
                { ownerFacilityId: this.ownerFacilityId }
            )
            .where('PartnerFacility.ownerFacilityId = :ownerFacilityId', { ownerFacilityId: this.ownerFacilityId })
            .andWhere('PartnerFacility.facilityId = :facilityId', { facilityId: this.ownerFacilityId });
    }
}
