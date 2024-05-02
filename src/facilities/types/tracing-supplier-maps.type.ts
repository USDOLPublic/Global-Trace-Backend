import { FacilityEntity } from '~facilities/entities/facility.entity';

export type TracingSupplierMapsType = {
    allSuppliersMap: Map<string, FacilityEntity>;
    tracedSupplierMap: Map<string, FacilityEntity>;
};
