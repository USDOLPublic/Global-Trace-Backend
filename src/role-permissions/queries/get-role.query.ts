import { BaseQuery } from '@diginexhk/typeorm-helper';
import { SelectQueryBuilder } from 'typeorm';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { GetRoleParamType } from '~role-permissions/types/get-role.type';

export class GetRoleQuery extends BaseQuery<RoleEntity> {
    constructor(private params: GetRoleParamType) {
        super();
    }

    alias(): string {
        return 'Role';
    }

    async query(query: SelectQueryBuilder<RoleEntity>) {
        const { id } = this.params;

        query.leftJoinAndSelect(`${this.alias()}.permissions`, 'permissions').where({ id });
    }
}
