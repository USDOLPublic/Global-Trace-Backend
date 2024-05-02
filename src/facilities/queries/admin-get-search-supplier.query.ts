import { BaseQuery } from '@diginexhk/typeorm-helper';
import { In, SelectQueryBuilder } from 'typeorm';
import { convertStringFullTextSearch, replaceSpecialCharactersIfExist } from '~core/helpers/string.helper';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export class AdminGetAndSearchSupplierQuery extends BaseQuery<FacilityEntity> {
    constructor(private roleIds: string[], private key: string) {
        super();
    }

    alias(): string {
        return 'Facility';
    }

    query(query: SelectQueryBuilder<FacilityEntity>) {
        query.leftJoinAndSelect(`${this.alias()}.type`, 'Role').where({ typeId: In(this.roleIds) });

        if (this.key) {
            query.andWhere(`("fullTextSearchable" @@ to_tsquery('simple', :key))`, {
                key: convertStringFullTextSearch(replaceSpecialCharactersIfExist(this.key))
            });
        }
    }
}
