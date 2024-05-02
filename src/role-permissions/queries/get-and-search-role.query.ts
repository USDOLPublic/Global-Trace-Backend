import { BaseQuery } from '@diginexhk/typeorm-helper';
import { ILike, In, Not, SelectQueryBuilder } from 'typeorm';
import { convertStringToSearch } from '~core/helpers/string.helper';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { SearchingRoleParamType } from '~role-permissions/types/search-role-param.type';

export class GetAndSearchRoleQuery extends BaseQuery<RoleEntity> {
    constructor(private params: SearchingRoleParamType) {
        super();
    }

    alias(): string {
        return 'Role';
    }

    async query(query: SelectQueryBuilder<RoleEntity>) {
        const { key, type, excludedRoleIds } = this.params;

        query.leftJoinAndSelect(`${this.alias()}.permissions`, 'permissions');

        if (key) {
            query.andWhere({ name: ILike(`%${convertStringToSearch(key)}%`) });
        }

        if (type) {
            query.andWhere({ type });
        }

        if (excludedRoleIds?.length) {
            // for inviting user
            query.andWhere({ id: Not(In(excludedRoleIds)) });
        } else {
            // for role management of super admin
            query.andWhere({ isHidden: false });
        }
    }

    order(query: SelectQueryBuilder<RoleEntity>) {
        for (const sortParam of this.params.sortParams) {
            switch (sortParam.field) {
                case 'name':
                    query.addOrderBy(`${this.alias()}.name`, sortParam.direction);
                    break;
                case 'type':
                    query.addOrderBy(`${this.alias()}.type`, sortParam.direction);
                    break;
                case 'lastUpdate':
                    query.addOrderBy(`${this.alias()}.updatedAt`, sortParam.direction);
                    break;
                default:
                    query.addOrderBy(`${this.alias()}.${sortParam.field}`, sortParam.direction);
            }
        }
    }
}
