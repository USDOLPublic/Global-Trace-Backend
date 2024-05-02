import { FacilityEntity } from '~facilities/entities/facility.entity';
import { UserEntity } from '~users/entities/user.entity';

export type FacilityPartnerCreatedResultType = {
    facilityPartner: FacilityEntity;
    contactor: UserEntity;
};
