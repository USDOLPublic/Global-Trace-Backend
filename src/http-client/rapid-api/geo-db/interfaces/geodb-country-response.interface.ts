import { RapidResponseInterface } from '~http-client/rapid-api/interfaces/rapid-response.interface';

interface CountryResponseInterface {
    code: string;
    currencyCodes: string[];
    name: string;
    wikiDataId: string;
}

export interface GeodbCountryResponseInterface extends RapidResponseInterface {
    data: CountryResponseInterface[];
}
