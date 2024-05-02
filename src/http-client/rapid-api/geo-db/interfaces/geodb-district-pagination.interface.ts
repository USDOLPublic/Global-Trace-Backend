import { LocationItemInterface } from '~locations/interfaces/location-item.interface';

export interface GeodbDistrictPaginationInterface {
    items: LocationItemInterface[];
    metadata: {
        currentOffset: number;
        totalCount: number;
    };
}
