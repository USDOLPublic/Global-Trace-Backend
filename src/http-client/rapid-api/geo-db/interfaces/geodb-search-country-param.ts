import { RapidPaginationParam } from '~http-client/rapid-api/geo-db/interfaces/geodb-pagination-param.interface';

export interface RapidSearchCountryParamInterface extends RapidPaginationParam {
    name?: string;
}
