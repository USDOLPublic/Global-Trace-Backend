import { ProvinceEntity } from '~locations/entities/province.entity';

export interface DistrictItemInterface {
    province?: ProvinceEntity;
    districtCode: number;
    district: string;
}
