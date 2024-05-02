import { GeocodedGeometry } from '~http-client/open-apparel-registry/types/oar-facility-search-response.type';

type OarFacilityContributor = {
    id: number;
    name: string;
    isVerified: boolean;
};

export type OarFacilityType = {
    id: string;
    type: string;
    geometry: GeocodedGeometry;
    properties: {
        name: string;
        address: string;
        countryCode: string;
        osId: string;
        otherNames: string[];
        otherAddresses: string[];
        contributors: OarFacilityContributor[];
        countryName?: string;
        claimInfo?: any;
        otherLocation?: string[];
    };
};
