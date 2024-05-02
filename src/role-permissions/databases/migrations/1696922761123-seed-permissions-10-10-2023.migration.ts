import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import roleHasPermissions from '~role-permissions/databases/data/role-permissions-09-19-2023-v1.json';
import format from 'pg-format';

export class SeedPermissions101020231696922761123 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query('DELETE FROM "RoleHasPermission"');

        for (const { roleId, permissionIds } of roleHasPermissions) {
            const addData = permissionIds.map((permissionId) => [roleId, permissionId]);

            await this.insertRoleHasPermissions(queryRunner, addData);
        }
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query('DELETE FROM "RoleHasPermission"');
    }

    private async insertRoleHasPermissions(queryRunner: QueryRunner, data): Promise<void> {
        const sql = format('INSERT INTO "RoleHasPermission" ("roleId", "permissionId") VALUES %L', data);
        await queryRunner.query(sql);
    }
}
