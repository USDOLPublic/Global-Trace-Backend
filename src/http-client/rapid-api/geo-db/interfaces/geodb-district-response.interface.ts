import { RapidResponseInterface } from '~http-client/rapid-api/interfaces/rapid-response.interface';

interface DistrictResponseInterface {
    id: number;
    wikiDataId: string;
    name: string;
    country: string;
    countryCode: string;
    region: string;
    regionCode: string;
    latitude: number;
    longitude: number;
    population: number;
}

export interface GeodbDistrictResponseInterface extends RapidResponseInterface {
    data: DistrictResponseInterface[];
}
