export type OarIdFeature = {
    id: string;
    type: string;
    geometry: {
        type: string;
        coordinates: string[];
    };
    properties: {
        name: string;
        address: string;
        facilityAddress1?: string;
        facilityAddress2?: string;
        countryCode: string;
        countryName: string;
        osId: string;
    };
};

export type CheckOarIdResponse = {
    type: string;
    features: OarIdFeature[];
};
