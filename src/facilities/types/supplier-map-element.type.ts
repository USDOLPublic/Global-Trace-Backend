import { FacilityEntity } from '~facilities/entities/facility.entity';

export type SupplierMapElementType = {
    label: string;
    targets: string[];
    type: string;
} & Partial<FacilityEntity>;
