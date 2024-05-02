import { BaseQuery } from '@diginexhk/typeorm-helper';
import { Not, SelectQueryBuilder } from 'typeorm';
import { convertStringFullTextSearch, replaceSpecialCharactersIfExist } from '~core/helpers/string.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export class SearchFacilitiesByNameQuery extends BaseQuery<FacilityEntity> {
    constructor(private currentFacilityId: string, private supplierRoleIds: string[], private key: string) {
        super();
    }

    alias(): string {
        return 'Facility';
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        query.leftJoinAndSelect(`${this.alias()}.users`, 'users');
        query.leftJoinAndSelect(`${this.alias()}.type`, 'type');
        query
            .where(
                `NOT EXISTS (SELECT 1 FROM "FacilityPartner" WHERE ${this.alias()}.id = "FacilityPartner"."partnerId" AND "facilityId" = :currentFacilityId AND "ownerFacilityId" = :currentFacilityId)`,
                { currentFacilityId: this.currentFacilityId }
            )
            .andWhere({ id: Not(this.currentFacilityId) })
            .andWhere('type.id IN (:...supplierRoleIds)', { supplierRoleIds: this.supplierRoleIds });

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
