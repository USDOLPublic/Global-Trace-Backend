import { CountryEntity } from '~locations/entities/country.entity';
import { DistrictEntity } from '~locations/entities/district.entity';
import { ProvinceEntity } from '~locations/entities/province.entity';

export type RegisterOarIdConfirmMatchResponseType = {
    name: string;
    address: string;
    oarId: string;
    countryId: string;
    provinceId: string;
    districtId: string;
    country: CountryEntity;
    province: ProvinceEntity;
    district: DistrictEntity;
    facilityMatchId?: number;
    isConfirmed?: boolean;
};
