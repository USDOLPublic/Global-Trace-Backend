import { FacilityEntity } from '~facilities/entities/facility.entity';

export type CheckExistedFacilityResult = {
    existedFacilityEmail: FacilityEntity | undefined;
    existedFacilityOarId: FacilityEntity | undefined;
    existedFacility: FacilityEntity | undefined;
};
