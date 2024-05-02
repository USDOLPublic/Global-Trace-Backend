import { BaseQuery } from '@diginexhk/typeorm-helper';
import { In, SelectQueryBuilder } from 'typeorm';
import { FacilityPartnerEntity } from '~facilities/entities/facility-partner.entity';

export class GetFacilityBusinessBrokerPartnerQuery extends BaseQuery<FacilityPartnerEntity> {
    constructor(private facilityIds: string[], private typeIds: string[] = []) {
        super();
    }

    alias(): string {
        return 'FacilityPartner';
    }

    query(query: SelectQueryBuilder<FacilityPartnerEntity>) {
        query.where({ facilityId: In(this.facilityIds) });

        if (this.typeIds && this.typeIds.length) {
            query.andWhere(`${this.alias()}.typeId IN (:...typeIds)`, { typeIds: this.typeIds });
        }
    }
}
