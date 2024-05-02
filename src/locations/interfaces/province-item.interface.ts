import { CountryEntity } from '~locations/entities/country.entity';

export interface ProvinceItemInterface {
    country: CountryEntity;
    provinceCode?: string;
    province?: string;
}
