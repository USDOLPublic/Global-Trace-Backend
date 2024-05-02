import { OarFacilityConfirmedMatchedStatusEnum } from '~http-client/open-apparel-registry/enums/oar-facility-confirmed-matched-status.enum';

export type OarFacilityConfirmedMatch = {
    status: OarFacilityConfirmedMatchedStatusEnum;
    confidence: number;
    results: {
        matchedType: string;
        codeVersion: string;
        recallWeight: number;
        automaticThresHold: number;
        gazetteerThresHold: number;
        noGazetteerMatches: boolean;
    };
    osId: string;
    name: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    isActive: boolean;
};

export type OarConfirmFacilityMatchedResponseType = {
    id: string;
    matches: OarFacilityConfirmedMatch[];
    rowIndex: number;
    address: string;
    name: string;
    rawData: string;
    status: 'CONFIRMED_MATCH';
    processingStartedAt: any;
    processingCompletedAt: any;
    countryCode: string;
    facilityList: number;
    countryName: string;
    processingErrors: any;
    listStatuses: string[];
    matchedFacility: {
        osId: string;
        name: string;
        address: string;
        location: {
            lat: number;
            lng: number;
        };
        createdFromId: number;
    };
};
