import { GeodbDistrictResponseInterface } from '~http-client/rapid-api/geo-db/interfaces/geodb-district-response.interface';
import { GeodbDistrictPaginationInterface } from '~http-client/rapid-api/geo-db/interfaces/geodb-district-pagination.interface';
import { GeodbCountryResponseInterface } from '~http-client/rapid-api/geo-db/interfaces/geodb-country-response.interface';
import { GeodbCountryPaginationInterface } from '~http-client/rapid-api/geo-db/interfaces/geodb-country-pagination.interface';
import { RapidSearchCountryParamInterface } from '~http-client/rapid-api/geo-db/interfaces/geodb-search-country-param';
import { RapidSearchDistrictParam } from '~http-client/rapid-api/geo-db/interfaces/geodb-search-district-param';

export interface RapidApiGeoDbBaseInterface {
    normalizeDistrictData(response: GeodbDistrictResponseInterface): GeodbDistrictPaginationInterface;
    normalizeCountryData(response: GeodbCountryResponseInterface): GeodbCountryPaginationInterface;
    getCountry(searchParams: RapidSearchCountryParamInterface): Promise<GeodbCountryPaginationInterface>;
    getDistricts(searchParams: RapidSearchDistrictParam): Promise<GeodbDistrictPaginationInterface>;
}
