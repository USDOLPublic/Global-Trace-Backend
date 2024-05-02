import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateDefaultLogPurchaseOfGinner1686557075037 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`
            UPDATE "RoleHasPermission"
            SET "metadata" = '{"purchaseFrom": ["ca7c964c-0b7c-4f48-aa2a-175a97139688", "8f356b17-cdf7-4ff9-8cc5-8f41041b3fcb"]}'
            FROM "RoleHasPermission" "rhp"
            INNER JOIN "Role" "rol" ON "rhp"."roleId" = "rol"."id"
            INNER JOIN "Permission" "per" ON "rhp"."permissionId" = "per"."id"
            WHERE "rol"."name" = 'GINNER' and "per"."action" = 'LOG_PURCHASES'
                AND "RoleHasPermission"."id" = "rhp"."id";
            `);
    }
}
