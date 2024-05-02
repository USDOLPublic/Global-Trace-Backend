import { env } from '~config/env.config';
import { RapidApiBaseService } from '~http-client/rapid-api/services/rapid-api-base.service';
import { GeodbCountryResponseInterface } from '~http-client/rapid-api/geo-db/interfaces/geodb-country-response.interface';
import { GeodbCountryPaginationInterface } from '~http-client/rapid-api/geo-db/interfaces/geodb-country-pagination.interface';
import { Global, Injectable } from '@nestjs/common';
import { RapidSearchCountryParamInterface } from '~http-client/rapid-api/geo-db/interfaces/geodb-search-country-param';
import { RapidSearchDistrictParam } from '~http-client/rapid-api/geo-db/interfaces/geodb-search-district-param';
import { GeodbDistrictResponseInterface } from '~http-client/rapid-api/geo-db/interfaces/geodb-district-response.interface';
import { GeodbDistrictPaginationInterface } from '~http-client/rapid-api/geo-db/interfaces/geodb-district-pagination.interface';
import { RapidApiGeoDbBaseInterface } from '~http-client/rapid-api/geo-db/interfaces/rapid-geo-db-base.interface';

@Global()
@Injectable()
export class RapidApiGeoDbBaseService extends RapidApiBaseService implements RapidApiGeoDbBaseInterface {
    public constructor() {
        super(env.RAPID_API.GEO_DB.BASE_URL, env.RAPID_API.GEO_DB.HOST);
    }

    normalizeDistrictData(response: GeodbDistrictResponseInterface): GeodbDistrictPaginationInterface {
        const items = response.data.map((district) => ({
            districtCode: district.id,
            district: district.name,
            provinceCode: district.regionCode,
            province: district.region,
            countryCode: district.countryCode,
            country: district.country
        }));

        return {
            items,
            metadata: response.metadata
        };
    }

    normalizeCountryData(response: GeodbCountryResponseInterface): GeodbCountryPaginationInterface {
        const items = response.data.map(({ code: countryCode, name: countryName }) => ({ countryCode, countryName }));

        return {
            items,
            metadata: response.metadata
        };
    }

    async getCountry(searchParams: RapidSearchCountryParamInterface): Promise<GeodbCountryPaginationInterface> {
        const { offset, limit, name } = searchParams;
        const params: { limit: number; offset: number; namePrefix?: string } = {
            limit,
            offset
        };
        if (name) {
            params.namePrefix = name;
        }
        const response = (await this.get('/countries', { params })) as GeodbCountryResponseInterface;
        return this.normalizeCountryData(response);
    }

    async getDistricts(searchParams: RapidSearchDistrictParam): Promise<GeodbDistrictPaginationInterface> {
        const { countryIds, offset, limit = env.RAPID_API.MAX_PAGE_LIMIT } = searchParams;
        const response = (await this.get(`/adminDivisions`, {
            params: {
                offset,
                limit,
                countryIds
            }
        })) as GeodbDistrictResponseInterface;
        return this.normalizeDistrictData(response);
    }
}
