import { FacilityEntity } from '~facilities/entities/facility.entity';

export type SearchingFacilityQueryParamType = {
    key?: string;
    types?: string[];
    isFilledAddress?: boolean;
    excludedPartnerTypes?: string[];
    isExcludeAddedPartners?: boolean;
    ownerFacility?: FacilityEntity;
};
