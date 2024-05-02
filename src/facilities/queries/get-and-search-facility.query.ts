import { BaseQuery } from '@diginexhk/typeorm-helper';
import { Brackets, IsNull, Not, SelectQueryBuilder } from 'typeorm';
import {
    convertStringFullTextSearch,
    convertStringToSearch,
    replaceSpecialCharactersIfExist
} from '~core/helpers/string.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { SearchingFacilityQueryParamType } from '~facilities/types/searching-facility-query-param.type';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';

export class GetAndSearchFacilityQuery extends BaseQuery<FacilityEntity> {
    constructor(private params: SearchingFacilityQueryParamType) {
        super();
    }

    get key(): string {
        return this.params.key;
    }

    get types(): string[] | undefined {
        return this.params.types;
    }

    get isFilledAddress(): boolean {
        return this.params.isFilledAddress ?? false;
    }

    get isSearchingFarmById() {
        return this.key.includes('-');
    }

    get excludedPartnerTypes(): string[] | undefined {
        return this.params.excludedPartnerTypes;
    }

    get isExcludeAddedPartners(): boolean {
        return this.params.isExcludeAddedPartners ?? false;
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

    addSearchingFacilityByKeyCondition(query: SelectQueryBuilder<FacilityEntity>) {
        query.andWhere(
            new Brackets((qb) => {
                qb.where(`("${this.alias()}"."fullTextSearchable" @@ to_tsquery('simple', :key))`, {
                    key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(this.key))
                }).orWhere(`${this.alias()}.farmId ILIKE :farmId`, { farmId: `%${convertStringToSearch(this.key)}%` });
            })
        );
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        this.joinRelationShips(query);

        query.andWhere('Role.name NOT IN (:...blacklistTypes)', {
            blacklistTypes: [UserRoleEnum.BROKER, UserRoleEnum.TRANSPORTER]
        });

        if (this.key) {
            this.addSearchingFacilityByKeyCondition(query);
        }

        if (this.types) {
            query.andWhere('Role.type IN (:...types)', { types: this.types });
        }

        if (this.isFilledAddress) {
            query.andWhere({ address: Not(IsNull()) });
        }

        if (this.excludedPartnerTypes?.length) {
            query.andWhere(
                `NOT EXISTS (
                    SELECT * FROM "FacilityPartner"
                    INNER JOIN "Role" ON "FacilityPartner"."typeId" = "Role"."id"
                    WHERE "Facility"."id" = "FacilityPartner"."facilityId" 
                        AND "Facility"."id" = "FacilityPartner"."ownerFacilityId" 
                        AND "Role"."name" IN (${this.excludedPartnerTypes})
                )`
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
            { ownerFacilityId: this.params.ownerFacility.id }
        );
    }

    order(query: SelectQueryBuilder<FacilityEntity>) {
        query.orderBy(`${this.alias()}.name`, 'ASC');
    }
}
