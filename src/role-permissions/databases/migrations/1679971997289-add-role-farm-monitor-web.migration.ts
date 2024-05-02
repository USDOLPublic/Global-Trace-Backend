import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import roles from '~role-permissions/databases/data/roles-03-28-2023.json';
import { getInsertRoleQueryHelper } from '../helpers/get-insert-role-query.helper';

export class AddRoleFarmMonitorWeb1679971997289 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(getInsertRoleQueryHelper(roles));
    }

    async rollback(queryRunner: QueryRunner) {
        const roleIds = roles.map(({ id }) => `'${id}'`);
        await queryRunner.query(`DELETE FROM "Role" WHERE "id" IN (${roleIds});`);
    }
}
