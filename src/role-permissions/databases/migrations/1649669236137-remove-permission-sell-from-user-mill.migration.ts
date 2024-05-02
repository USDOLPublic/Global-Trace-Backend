import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RemovePermissionSellFromUserMill1649669236137 extends BaseMigration {
    private millRoleId = '5e429ca1-1a7f-42dc-b9f8-733caded03fe';
    private sellPermissionId = 'bb0ae46a-4a75-4957-b73f-c340c81c634e';

    async run(queryRunner: QueryRunner) {
        await queryRunner.query('DELETE FROM "RoleHasPermission" WHERE "roleId" = $1 AND "permissionId" = $2;', [
            this.millRoleId,
            this.sellPermissionId
        ]);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query('INSERT INTO "RoleHasPermission" ("roleId", "permissionId") VALUES ($1, $2)', [
            this.millRoleId,
            this.sellPermissionId
        ]);
    }
}
