import { BaseQuery } from '@diginexhk/typeorm-helper';
import { Brackets, In, SelectQueryBuilder } from 'typeorm';
import {
    convertStringFullTextSearch,
    convertStringToSearch,
    replaceSpecialCharactersIfExist
} from '~core/helpers/string.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { SearchFacilitiesQueryParamType } from '~facilities/types/search-facilities-query-param.type';

export class SearchExistingFacilitiesQuery extends BaseQuery<FacilityEntity> {
    constructor(private param: SearchFacilitiesQueryParamType) {
        super();
    }

    get key(): string {
        return this.param.key;
    }

    get isExcludeAddedPartners(): boolean {
        return this.param.isExcludeAddedPartners ?? true;
    }

    get partnerRoleIds(): string[] {
        return this.param.partnerRoleIds;
    }

    get ownerFacility(): FacilityEntity {
        return this.param.ownerFacility;
    }

    alias(): string {
        return 'Facility';
    }

    joinRelationShips(query: SelectQueryBuilder<FacilityEntity>) {
        query
            .leftJoinAndSelect(`${this.alias()}.users`, 'User')
            .leftJoinAndSelect(`${this.alias()}.type`, 'Role')
            .leftJoinAndSelect(`${this.alias()}.country`, 'Country')
            .leftJoinAndSelect(`${this.alias()}.province`, 'Province')
            .leftJoinAndSelect(`${this.alias()}.district`, 'District')
            .leftJoinAndSelect(`${this.alias()}.farmGroup`, 'farmGroup');
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        this.joinRelationShips(query);

        query.andWhere({ typeId: In(this.partnerRoleIds) });

        if (this.key) {
            query.andWhere(
                new Brackets((subQuery) => {
                    subQuery
                        .where(`("${this.alias()}"."fullTextSearchable" @@ to_tsquery('simple', :key))`, {
                            key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(this.key))
                        })
                        .orWhere(`${this.alias()}.farmId ILIKE :farmId`, {
                            farmId: `%${convertStringToSearch(this.key)}%`
                        });
                })
            );
        }

        if (this.isExcludeAddedPartners) {
            this.excludeAddedPartners(query);
        }
    }

    private excludeAddedPartners(query: SelectQueryBuilder<FacilityEntity>): void {
        query.andWhere(
            `NOT EXISTS (
                SELECT * FROM "FacilityPartner"
                WHERE "Facility"."id" = "FacilityPartner"."partnerId" 
                    AND "FacilityPartner"."ownerFacilityId" = "FacilityPartner"."facilityId"
                    AND "FacilityPartner"."ownerFacilityId" = :ownerFacilityId
            )`,
            { ownerFacilityId: this.ownerFacility.id }
        );
    }

    order(query: SelectQueryBuilder<FacilityEntity>) {
        query.orderBy(`${this.alias()}.name`, 'ASC');
    }
}
