import {
    GOOGLE_MAP_COUNTRY_ALIAS,
    GOOGLE_MAP_DISTRICT_ALIAS,
    GOOGLE_MAP_PROVINCE_ALIAS,
    GOOGLE_MAP_TOWN_ALIAS
} from '~http-client/google-map/constants/google-map-api.constant';
import { GoogleMapLocationType } from '~http-client/open-apparel-registry/types/google-map-location.type';
import { LocationExtractionResponseType } from '~http-client/google-map/types/location-extraction-response.type';
import { trimDistrictName, trimProvinceName } from '~locations/helpers/location.helper';

export function extractLocation(location: GoogleMapLocationType | undefined): LocationExtractionResponseType {
    if (!location) {
        return {
            country: undefined,
            district: undefined,
            province: undefined
        };
    }

    const country = location.addressComponents.find(({ types }) => types.includes(GOOGLE_MAP_COUNTRY_ALIAS));
    const province = location.addressComponents.find(({ types }) => types.includes(GOOGLE_MAP_PROVINCE_ALIAS));
    const district =
        location.addressComponents.find(({ types }) => types.includes(GOOGLE_MAP_DISTRICT_ALIAS)) ||
        location.addressComponents.find(({ types }) => types.includes(GOOGLE_MAP_TOWN_ALIAS));

    return {
        country: country?.longName,
        province: trimProvinceName(province?.longName),
        district: trimDistrictName(district?.longName)
    };
}
