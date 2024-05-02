import format from 'pg-format';
import { BusinessDetailType } from '~site-details/types/business-detail.type';

export const getInsertBusinessDetailQueryHelper = (businessDetails: BusinessDetailType[]) => {
    let query = 'INSERT INTO "BusinessDetail" ("id", "sector", "country", "startDateOfSeason") VALUES %L';
    const values = businessDetails.map((bU) => Object.values(bU));
    return format(query, values);
};
