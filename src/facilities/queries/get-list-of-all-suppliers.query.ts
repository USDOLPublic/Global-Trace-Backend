import { SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { SelectQueryBuilder } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { GetFacilityWithLocationRelationsBaseQuery } from './get-facility-with-location-relations-base.query';

export class GetListOfAllSuppliersQuery extends GetFacilityWithLocationRelationsBaseQuery {
    constructor(private currentFacilityId: string, private sortParams: SortMultipleParams[]) {
        super();
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        query.leftJoinAndSelect(`${this.alias()}.users`, 'users');
        query.leftJoinAndSelect(`${this.alias()}.type`, 'type');
        query.innerJoin(`${this.alias()}.partnerFacilities`, 'partnerFacilities');
        query.leftJoinAndSelect(`partnerFacilities.type`, 'partnerFacilitiesType');
        query.leftJoinAndMapMany(
            `${this.alias()}.facilityPartners`,
            `${this.alias()}.facilityPartners`,
            'facilityPartners',
            'facilityPartners.ownerFacilityId = :ownerFacilityId',
            { ownerFacilityId: this.currentFacilityId }
        );
        query.where('partnerFacilities.ownerFacilityId = :currentFacilityId', {
            currentFacilityId: this.currentFacilityId
        });
        query.andWhere('partnerFacilities.facilityId = :currentFacilityId', {
            currentFacilityId: this.currentFacilityId
        });

        super.query(query);
    }

    order(query: SelectQueryBuilder<FacilityEntity>) {
        for (const sortParam of this.sortParams) {
            if (!sortParam.field.includes('.')) {
                sortParam.field = `${this.alias()}.${sortParam.field}`;
            }
            query.addOrderBy(sortParam.field, sortParam.direction);
        }
    }
}
