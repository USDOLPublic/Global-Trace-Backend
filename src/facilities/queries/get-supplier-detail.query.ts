import { SelectQueryBuilder } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { AdditionalRoleEnum } from '~facilities/enums/additional-role.enum';
import { GetFacilityWithLocationRelationsBaseQuery } from './get-facility-with-location-relations-base.query';

export class GetSupplierDetailQuery extends GetFacilityWithLocationRelationsBaseQuery {
    constructor(private facilityId: string) {
        super();
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        super.query(query);
        query
            .withDeleted()
            .leftJoinAndSelect('Facility.users', 'User')
            .leftJoinAndSelect('Facility.type', 'Role')
            .leftJoinAndSelect('Facility.farms', 'Farm', `Facility.additionalRole = :additionalRole`)
            .where({ id: this.facilityId })
            .setParameters({
                additionalRole: AdditionalRoleEnum.FARM_GROUP
            });
    }
}
