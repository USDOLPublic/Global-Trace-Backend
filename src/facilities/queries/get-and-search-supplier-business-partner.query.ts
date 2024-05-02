import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { convertStringFullTextSearch, replaceSpecialCharactersIfExist } from '~core/helpers/string.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { SearchingSupplierBusinessPartnerParamType } from '~facilities/types/searching-supplier-business-partner-param.type';
import { UserEntity } from '~users/entities/user.entity';

export class GetAndSearchSupplierBusinessPartnerQuery extends BaseQuery<FacilityEntity> {
    constructor(private params: SearchingSupplierBusinessPartnerParamType) {
        super();
    }

    get key(): string | undefined {
        return this.params.key;
    }

    get requester(): UserEntity {
        return this.params.requester;
    }

    get roleIds(): string[] {
        return this.params.roleIds;
    }

    alias(): string {
        return 'Facility';
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        query
            .innerJoin(`${this.alias()}.partnerFacilities`, 'partnerFacilities')
            .innerJoin(`${this.alias()}.type`, 'Role')
            .where('Role.id IN (:...roleIds)', { roleIds: this.roleIds })
            .andWhere('partnerFacilities.facilityId = :requesterFacilityId', {
                requesterFacilityId: this.requester.currentFacility.id
            })
            .andWhere('partnerFacilities.ownerFacilityId = :requesterFacilityId', {
                requesterFacilityId: this.requester.currentFacility.id
            });

        if (this.key) {
            query.andWhere(`("fullTextSearchable" @@ to_tsquery('simple', :key))`, {
                key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(this.key))
            });
        }
    }

    order(query: SelectQueryBuilder<FacilityEntity>) {
        query.orderBy(`${this.alias()}.name`, 'ASC');
    }
}
