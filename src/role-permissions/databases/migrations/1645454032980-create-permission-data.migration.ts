import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import permissions from '~role-permissions/databases/data/permissions.json';
import { getInsertPermissionQueryHelper } from '~role-permissions/databases/helpers/get-insert-permission-query.helper';

export class CreatePermissionData1645454032980 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(getInsertPermissionQueryHelper(permissions));
    }

    async rollback(queryRunner: QueryRunner) {
        const permissionIds = permissions.map(({ id }) => `'${id}'`);
        await queryRunner.query(`DELETE FROM "Permission" WHERE "id" IN (${permissionIds});`);
    }
}
