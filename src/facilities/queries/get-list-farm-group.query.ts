import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { AdditionalRoleEnum } from '~facilities/enums/additional-role.enum';

export class GetListFarmGroupQuery extends BaseQuery<FacilityEntity> {
    constructor(private roleId: string) {
        super();
    }

    alias(): string {
        return 'Facility';
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        query
            .leftJoinAndSelect(`${this.alias()}.type`, 'Role')
            .leftJoinAndSelect('Facility.country', 'Country')
            .leftJoinAndSelect('Facility.province', 'Province')
            .leftJoinAndSelect('Facility.district', 'District')
            .where(`${this.alias()}.typeId = :typeId`, { typeId: this.roleId })
            .andWhere(`${this.alias()}.additionalRole = :additionalRole`, {
                additionalRole: AdditionalRoleEnum.FARM_GROUP
            });
    }

    order(query: SelectQueryBuilder<FacilityEntity>) {
        query.orderBy(`${this.alias()}.createdAt`, 'DESC');
    }
}
