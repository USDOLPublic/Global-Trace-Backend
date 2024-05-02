import { Injectable } from '@nestjs/common';
import { DistrictRepository } from '../repositories/district.repository';
import { LocationItemInterface } from '~locations/interfaces/location-item.interface';
import { ProvinceRepository } from '~locations/repositories/province.repository';
import { CountryRepository } from '~locations/repositories/country.repository';
import { ProvinceItemInterface } from '~locations/interfaces/province-item.interface';
import { CountryItemInterface } from '~locations/interfaces/country-item.interface';
import { ProvinceEntity } from '~locations/entities/province.entity';
import { DistrictItemInterface } from '~locations/interfaces/district-item.interface';
import { DistrictEntity } from '~locations/entities/district.entity';
import { CountryEntity } from '~locations/entities/country.entity';
import { I18nHelper } from '~core/helpers/i18n.helper';
import { sortCountries, trimDistrictName, trimProvinceName } from '~locations/helpers/location.helper';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class LocationService {
    public constructor(
        private districtRepo: DistrictRepository,
        private provinceRepo: ProvinceRepository,
        private countryRepo: CountryRepository
    ) {}

    async getAndSearchCountries(key: string): Promise<CountryEntity[]> {
        const matchedCountries = await this.countryRepo.searchByKeyWord(key);
        sortCountries(matchedCountries);
        return I18nHelper.translate(matchedCountries, 'country');
    }

    async getAndSearchAllCountries(key: string): Promise<CountryEntity[]> {
        const matchedCountries = await this.countryRepo.searchAllCountriesByKeyWord(key);
        sortCountries(matchedCountries);
        return I18nHelper.translate(matchedCountries, 'country');
    }

    async listProvinces(countryId: string, key: string): Promise<ProvinceEntity[]> {
        const provinces = await this.provinceRepo.searchByKeyWord(countryId, key);
        return I18nHelper.translate(provinces, 'province');
    }

    async listDistricts(provinceId: string, key: string): Promise<DistrictEntity[]> {
        const districts = await this.districtRepo.searchByKeyWord(provinceId, key);
        return I18nHelper.translate(districts, 'district');
    }

    addCountries(data: CountryItemInterface[]) {
        return this.countryRepo.insertOrIgnore(data);
    }

    private findCountryByCode(countryCode: string) {
        return this.countryRepo.findOneBy({ countryCode });
    }

    findCountryById(id: string) {
        return this.countryRepo.findById(id);
    }

    findCountryByIds(ids: string[]) {
        return this.countryRepo.findByIds(ids);
    }

    findProvinceById(id: string) {
        return this.provinceRepo.findById(id);
    }

    findDistrictById(id: string) {
        return this.districtRepo.findById(id);
    }

    findCountry(options: FindOptionsWhere<CountryEntity>): Promise<CountryEntity> {
        return this.countryRepo.findOneBy(options);
    }

    findProvince(options: FindOptionsWhere<ProvinceEntity>): Promise<ProvinceEntity> {
        return this.provinceRepo.findOneBy(options);
    }

    findDistrict(options: FindOptionsWhere<DistrictEntity>): Promise<DistrictEntity> {
        return this.districtRepo.findOneBy(options);
    }

    async findLocation(countryName: string, provinceName: string, districtName: string) {
        let country: CountryEntity;
        let province: ProvinceEntity;
        let district: DistrictEntity;

        country = await this.countryRepo.findOneBy({ country: countryName });
        if (country) {
            province = await this.provinceRepo.findOneBy({ province: provinceName, countryId: country.id });
            if (province) {
                district = await this.districtRepo.findOneBy({ district: districtName, provinceId: province.id });
            }
        }

        return { country, province, district };
    }

    private async addProvince(data: ProvinceItemInterface): Promise<ProvinceEntity | undefined> {
        if (data.province && data.provinceCode) {
            const existedProvince = await this.provinceRepo.findOne({
                where: { countryId: data.country.id, provinceCode: data.provinceCode }
            });
            if (!existedProvince) {
                data.province = trimProvinceName(data.province);
                return this.provinceRepo.save(data);
            }

            return existedProvince;
        }
    }

    private async addDistrict(data: DistrictItemInterface): Promise<DistrictEntity> {
        if (data.province) {
            const existedDistrict = await this.districtRepo.findOne({
                where: { provinceId: data.province.id, districtCode: data.districtCode }
            });
            if (!existedDistrict) {
                data.district = trimDistrictName(data.district);
                return this.districtRepo.save(data);
            }

            return existedDistrict;
        }
    }

    async insertDistricts(districts: LocationItemInterface[]) {
        for (const { countryCode, provinceCode, province: provinceName, districtCode, district } of districts) {
            const country = await this.findCountryByCode(countryCode);
            const province = await this.addProvince({ country, provinceCode, province: provinceName });
            await this.addDistrict({ province, district, districtCode });
        }
    }
}
