import { OarIdLocation } from '~http-client/open-apparel-registry/types/oar-id-location.type';

type OarIdPotentialFacilityMatchedResult = {
    codeVersion: string;
    recallWeight: number;
    noGeocodedItems: boolean;
    automaticThresHold: number;
    gazetteerThresHold: number;
    noGazetteerMatches: boolean;
};

type OarIdPotentialFacilityMatched = {
    id: string;
    status: 'REJECTED';
    confidence: string;
    results: OarIdPotentialFacilityMatchedResult;
    osId: string;
    name: string;
    address: string;
    location: OarIdLocation;
    isActive: boolean;
};

type matchedFacility = {
    osId: string;
    address: string;
    name: string;
    createdFromId: number;
    location: OarIdLocation;
};

export enum RejectMatchOarIdStatusEnum {
    CONFIRMED_MATCH = 'CONFIRMED_MATCH',
    POTENTIAL_MATCH = 'POTENTIAL_MATCH'
}

export type OarIdConfirmMatchResponseType = {
    id: string;
    matches: OarIdPotentialFacilityMatched[];
    countryName: string;
    processingErrors: any;
    matchedFacility?: matchedFacility;
    ppeProductTypes: any;
    ppeContactEmail: any;
    ppeContactPhone: any;
    ppeWebsite: any;
    rowIndex: number;
    rawData: string;
    status: RejectMatchOarIdStatusEnum;
    processingStartedAt: any;
    processingCompletedAt: any;
    name: string;
    address: string;
    countryCode: string;
    cleanName: string;
    cleanAddress: string;
    source: 341685;
};
