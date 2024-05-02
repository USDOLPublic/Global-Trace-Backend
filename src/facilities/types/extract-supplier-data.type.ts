import { CreateSupplierFacilityType } from '~facilities/types/create-suppplier-facility.type';
import { CreateSupplierContactorType } from '~facilities/types/create-suppplier-contactor.type';

export type ExtractSupplierDataType = {
    facilityData: CreateSupplierFacilityType;
    contactorData: CreateSupplierContactorType;
};
