import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import roles from '~role-permissions/databases/data/roles-04-19-2022-v1.json';
import { getInsertRoleQueryHelper } from '~role-permissions/databases/helpers/get-insert-role-query.helper';

export class AddFinalProductAssemblyRoleForUser1650360445604 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(getInsertRoleQueryHelper(roles));
    }

    async rollback(queryRunner: QueryRunner) {
        const roleIds = roles.map(({ id }) => `'${id}'`);
        await queryRunner.query(`DELETE FROM "Role" WHERE "id" IN (${roleIds});`);
    }
}
