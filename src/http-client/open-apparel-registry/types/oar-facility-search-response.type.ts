import { RegisterOarIdStatusEnum } from '~http-client/open-apparel-registry/enums/register-oar-id-status.enum';
import { OarFacilityType } from '~http-client/open-apparel-registry/types/oar-facility.type';

export type GeocodedGeometry = {
    type: string;
    coordinates: number[];
};

type OarFacilityPotentialMatched = OarFacilityType & {
    confidence: number;
    confirmMatchUrl: string;
    rejectMatchUrl: string;
    textOnlyMatch: true;
};

export type OarFacilitySearchResponseType = {
    matches: OarFacilityPotentialMatched[];
    itemId: number;
    geocodedGeometry: GeocodedGeometry;
    geocodedAddress: string;
    status: RegisterOarIdStatusEnum;
    osId: string;
};
