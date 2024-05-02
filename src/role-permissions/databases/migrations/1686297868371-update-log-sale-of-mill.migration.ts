import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import roleHasPermissions from '~role-permissions/databases/data/role-permissions-05-22-2023-v1.json';

export class UpdateLogSaleOfMill1686297868371 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`
            UPDATE "RoleHasPermission"
            SET "metadata" = '{"sellTo": ["4a26e6c9-6b46-4e38-91fb-282e29533637"]}'
            FROM "RoleHasPermission" "rhp"
            INNER JOIN "Role" "rol" ON "rhp"."roleId" = "rol"."id"
            INNER JOIN "Permission" "per" ON "rhp"."permissionId" = "per"."id"
            WHERE "rol"."name" = '${roleHasPermissions.mill.name}' and "per"."action" = 'LOG_SALE'
                AND "RoleHasPermission"."id" = "rhp"."id";
        `);
    }
}
