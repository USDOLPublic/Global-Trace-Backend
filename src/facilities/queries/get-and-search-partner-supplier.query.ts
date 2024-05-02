import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { convertStringFullTextSearch, replaceSpecialCharactersIfExist } from '~core/helpers/string.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export class GetAndSearchPartnerSupplierQuery extends BaseQuery<FacilityEntity> {
    constructor(
        private currentFacilityId: string,
        private supplierId: string,
        private partnerTypeId: string,
        private key?: string
    ) {
        super();
    }

    alias(): string {
        return 'Facility';
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        query
            .innerJoin(`${this.alias()}.partnerFacilities`, 'partnerFacilities')
            .where('partnerFacilities.facilityId = :supplierId', { supplierId: this.supplierId })
            .andWhere('partnerFacilities.ownerFacilityId = :currentFacilityId', {
                currentFacilityId: this.currentFacilityId
            })
            .andWhere(`${this.alias()}.typeId = :partnerTypeId`, { partnerTypeId: this.partnerTypeId });

        if (this.key) {
            query.andWhere(`("fullTextSearchable" @@ to_tsquery('simple', :key))`, {
                key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(this.key))
            });
        }
    }
}
