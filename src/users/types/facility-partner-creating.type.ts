import { FacilityEntity } from '~facilities/entities/facility.entity';

export type FacilityPartnerCreatingType = {
    baseFacility: FacilityEntity;
    facilityPartner: FacilityEntity | undefined;
    creatorId: string;
    ownerFacility: FacilityEntity;
    isBrandSupplierPartner?: boolean;
};
