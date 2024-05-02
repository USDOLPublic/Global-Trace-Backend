export type GoogleMapAddressComponent = {
    longName: string;
    shortName: string;
    types: string[];
};

export type GoogleMapLocationType = {
    addressComponents: GoogleMapAddressComponent[];
    formattedAddress: string;
    geometry: any;
    placeId: string;
};
