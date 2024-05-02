import { RapidPaginationParam } from './geodb-pagination-param.interface';

export interface RapidSearchDistrictParam extends RapidPaginationParam {
    countryIds: string;
}
