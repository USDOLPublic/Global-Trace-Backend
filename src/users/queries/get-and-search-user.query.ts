import { SortMultipleParams } from '@diginexhk/nestjs-base-decorator';
import { BaseQuery } from '@diginexhk/typeorm-helper';
import { IsNull, Not, SelectQueryBuilder } from 'typeorm';
import { UserEntity } from '~users/entities/user.entity';

export class GetAndSearchUserQuery extends BaseQuery<UserEntity> {
    constructor(
        private currentUserId: string,
        private excludedRoleIds: string[],
        private sortParams: SortMultipleParams[]
    ) {
        super();
    }

    alias(): string {
        return 'User';
    }

    query(query: SelectQueryBuilder<UserEntity>) {
        query
            .innerJoinAndSelect(`${this.alias()}.role`, 'role')
            .leftJoinAndSelect(`role.hasPermissions`, 'hasPermissions')
            .leftJoinAndSelect(`hasPermissions.permission`, 'permission')
            .leftJoinAndSelect(`${this.alias()}.facilities`, 'facilities')
            .leftJoinAndSelect(`facilities.type`, 'type')
            .where({ deletedAt: IsNull(), id: Not(this.currentUserId) });

        if (this.excludedRoleIds.length) {
            query.andWhere(`"role"."id" NOT IN (:...roles)`, { roles: this.excludedRoleIds });
        }
    }

    order(query: SelectQueryBuilder<UserEntity>) {
        for (const sortParam of this.sortParams) {
            switch (sortParam.field) {
                case 'name':
                    query.addOrderBy(`${this.alias()}.firstName`, sortParam.direction);
                    query.addOrderBy(`${this.alias()}.lastName`, sortParam.direction);
                    break;
                case 'role':
                    query.addOrderBy('role.name', sortParam.direction);
                    break;
                case 'status':
                    query.addOrderBy(`${this.alias()}.status`, sortParam.direction);
                    break;
                case 'joinedAt':
                    query.addOrderBy(`${this.alias()}.joinedAt`, sortParam.direction, 'NULLS LAST');
                    break;
                default:
                    query.addOrderBy(`${this.alias()}.${sortParam.field}`, sortParam.direction);
            }
        }
    }
}
