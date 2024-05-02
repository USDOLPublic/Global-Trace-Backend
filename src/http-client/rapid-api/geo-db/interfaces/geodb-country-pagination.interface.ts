export interface CountryItemsInterface {
    countryCode: string;
    countryName: string;
}

export interface GeodbCountryPaginationInterface {
    items: CountryItemsInterface[];
    metadata: {
        currentOffset: number;
        totalCount: number;
    };
}
