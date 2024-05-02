import { FacilityEntity } from '~facilities/entities/facility.entity';

export type SearchFacilitiesQueryParamType = {
    partnerRoleIds: string[];
    ownerFacility: FacilityEntity;
    key?: string;
    isExcludeAddedPartners?: boolean;
};
