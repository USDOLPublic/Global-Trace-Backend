import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { convertStringToSearch } from '~core/helpers/string.helper';
import { PermissionEntity } from '~role-permissions/entities/permission.entity';
import { SearchingPermissionParamType } from '~role-permissions/types/search-permission-param.type';

export class GetAndSearchPermissionQuery extends BaseQuery<PermissionEntity> {
    constructor(private params: SearchingPermissionParamType) {
        super();
    }

    alias(): string {
        return 'Permission';
    }

    async query(query: SelectQueryBuilder<PermissionEntity>) {
        const { groupName } = this.params;

        query.where(`${this.alias()}.parentId IS NULL`);

        if (groupName) {
            query
                .leftJoinAndSelect(
                    `${this.alias()}.subPermissions`,
                    'subPermissions',
                    `subPermissions.groups ILIKE '%${convertStringToSearch(
                        groupName
                    )}%' OR subPermissions.groups IS NULL`
                )
                .andWhere(`${this.alias()}.groups ILIKE :groupName`, {
                    groupName: `%${convertStringToSearch(groupName)}%`
                });
        } else {
            query.leftJoinAndSelect(`${this.alias()}.subPermissions`, 'subPermissions');
        }
    }

    order(query: SelectQueryBuilder<PermissionEntity>) {
        query.addOrderBy(`${this.alias()}.sortOrder`, 'ASC').addOrderBy('subPermissions.sortOrder', 'ASC');
    }
}
