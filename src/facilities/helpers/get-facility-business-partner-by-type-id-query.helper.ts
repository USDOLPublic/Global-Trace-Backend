import { SelectQueryBuilder } from 'typeorm';
import { convertStringFullTextSearch, replaceSpecialCharactersIfExist } from '~core/helpers/string.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export function getFacilityBusinessPartnerByTypeIdQueryHelper(
    query: SelectQueryBuilder<FacilityEntity>,
    facility: FacilityEntity,
    typeIds: string[],
    key: string
): SelectQueryBuilder<FacilityEntity> {
    query
        .leftJoinAndSelect('Facility.users', 'FacilityUser')
        .innerJoinAndSelect('Facility.partnerFacilities', 'PartnerFacility')
        .leftJoinAndSelect('Facility.type', 'Role')
        .leftJoinAndSelect('PartnerFacility.type', 'PartnerFacilityType')
        .where('PartnerFacility.facilityId = :facilityId', { facilityId: facility.id })
        .andWhere('PartnerFacility.ownerFacilityId = :ownerFacilityId', { ownerFacilityId: facility.id })
        .andWhere('Role.id IN (:...typeIds)', { typeIds })
        .orderBy('PartnerFacility.createdAt', 'DESC');

    if (key) {
        query.andWhere(`("fullTextSearchable" @@ to_tsquery('simple', :key))`, {
            key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(key))
        });
    }

    return query;
}
