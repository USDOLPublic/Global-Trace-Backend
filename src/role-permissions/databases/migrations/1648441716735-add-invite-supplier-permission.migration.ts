import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import permissions from '~role-permissions/databases/data/permissions-03-28-2022-v1.json';
import { getInsertPermissionQueryHelper } from '~role-permissions/databases/helpers/get-insert-permission-query.helper';

export class AddInviteSupplierPermission1648441716735 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(getInsertPermissionQueryHelper(permissions));
    }

    async rollback(queryRunner: QueryRunner) {
        const permissionIds = permissions.map(({ id }) => `'${id}'`);
        await queryRunner.query(`DELETE FROM "Permission" WHERE "id" IN (${permissionIds});`);
    }
}
