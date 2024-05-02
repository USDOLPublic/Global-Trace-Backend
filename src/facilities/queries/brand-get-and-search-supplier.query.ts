import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { convertStringFullTextSearch, replaceSpecialCharactersIfExist } from '~core/helpers/string.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export class BrandGetAndSearchSupplierQuery extends BaseQuery<FacilityEntity> {
    constructor(private currentFacilityId: string, private key: string) {
        super();
    }

    alias(): string {
        return 'Facility';
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        query
            .innerJoin(`${this.alias()}.partnerFacilities`, 'partnerFacilities')
            .where('partnerFacilities.facilityId = :currentFacilityId', { currentFacilityId: this.currentFacilityId })
            .andWhere('partnerFacilities.ownerFacilityId = :currentFacilityId', {
                currentFacilityId: this.currentFacilityId
            });

        if (this.key) {
            query.andWhere(`("fullTextSearchable" @@ to_tsquery('simple', :key))`, {
                key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(this.key))
            });
        }
    }
}
