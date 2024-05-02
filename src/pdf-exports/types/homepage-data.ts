import { FacilityEntity } from '~facilities/entities/facility.entity';

export type HomePageData = Partial<FacilityEntity> & { phoneNumber?: string };
