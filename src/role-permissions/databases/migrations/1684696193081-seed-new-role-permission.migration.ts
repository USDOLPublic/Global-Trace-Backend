import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import permissionV2s from '~role-permissions/databases/data/permissions-05-22-2023-v1.json';
import permissions from '~role-permissions/databases/data/permissions.json';
import { SystemPermissionTypeV2 } from '~role-permissions/types/system-permission-v2.type';
import { getInsertPermissionQueryHelper } from '../helpers/get-insert-permission-query.helper';
import roleHasPermissions from '~role-permissions/databases/data/role-permissions-05-22-2023-v1.json';
import format from 'pg-format';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { UserInterfaceEnum } from '~role-permissions/enums/user-interface.enum';

export class SeedNewRolePermission1684696193081 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`DELETE FROM "Permission";`);
        await queryRunner.query(
            `INSERT INTO "Role" (id, name) VALUES ('ca7c964c-0b7c-4f48-aa2a-175a97139688', 'FARM');`
        );
        await queryRunner.query(this.getInsertPermissionQueryHelper(permissionV2s));
        await this.seedRoleHasPermissionsForDefaultRoles(queryRunner);
        await this.updateInterfaces(queryRunner);
    }

    async rollback(queryRunner: QueryRunner) {
        const permissionIds = permissionV2s.map(({ id }) => `'${id}'`);
        await queryRunner.query(`DELETE FROM "Permission" WHERE "id" IN (${permissionIds});`);
        await queryRunner.query(`DELETE FROM "Role" WHERE "id" = 'ca7c964c-0b7c-4f48-aa2a-175a97139688');`);

        await queryRunner.query(getInsertPermissionQueryHelper(permissions));
    }

    private async updateInterfaces(queryRunner: QueryRunner) {
        await queryRunner.query(`
            UPDATE "Role" SET "userInterfaces" = '["${UserInterfaceEnum.MOBILE}"]' 
            WHERE "name" IN (${this.convertArrToString([
                UserRoleEnum.GINNER,
                UserRoleEnum.FARM_MONITOR,
                UserRoleEnum.AUDITOR
            ])})
        `);

        await queryRunner.query(`
            UPDATE "Role" SET "userInterfaces" = '["${UserInterfaceEnum.WEB_APPS}"]' 
            WHERE "name" IN (${this.convertArrToString([
                UserRoleEnum.SUPER_ADMIN,
                UserRoleEnum.ADMIN,
                UserRoleEnum.SPINNER,
                UserRoleEnum.MILL,
                UserRoleEnum.BRAND,
                UserRoleEnum.FARM_MONITOR_WEB
            ])})
        `);
    }

    private convertArrToString = (arr) => arr.map((i) => `'${i}'`).join(',');

    private getInsertPermissionQueryHelper(permissionList: SystemPermissionTypeV2[]) {
        let query = 'INSERT INTO "Permission" ("id", "group", "set", "action", "name") VALUES %L';
        const values = permissionList.map((permission) => Object.values(permission));
        return format(query, values);
    }

    private async seedRoleHasPermissionsForDefaultRoles(queryRunner: QueryRunner) {
        await this.seedAdmin(queryRunner);
        await this.seedFarm(queryRunner);
        await this.seedGinner(queryRunner);
        await this.seedSpinner(queryRunner);
        await this.seedMill(queryRunner);
        await this.seedFarmMonitor(queryRunner);
        await this.seedSuperAdmin(queryRunner);
        await this.seedBrand(queryRunner);
    }

    private async seedAdmin(queryRunner: QueryRunner) {
        await queryRunner.query(`
        INSERT INTO "RoleHasPermission" ("roleId", "permissionId")
        SELECT "rol"."id", "per"."id"
        FROM "Role" "rol" CROSS JOIN "Permission" "per"
        WHERE "rol"."name" = '${roleHasPermissions.admin.name}' 
            AND "per"."action" IN (${this.convertArrToString(roleHasPermissions.admin.permissions)});
        `);
    }

    private async seedSuperAdmin(queryRunner: QueryRunner) {
        await queryRunner.query(`
        INSERT INTO "RoleHasPermission" ("roleId", "permissionId")
        SELECT "rol"."id", "per"."id"
        FROM "Role" "rol" CROSS JOIN "Permission" "per"
        WHERE "rol"."name" = '${roleHasPermissions.superAdmin.name}' 
            AND "per"."action" IN (${this.convertArrToString(roleHasPermissions.superAdmin.permissions)});
        `);
    }

    private async seedBrand(queryRunner: QueryRunner) {
        await queryRunner.query(`
        INSERT INTO "RoleHasPermission" ("roleId", "permissionId")
        SELECT "rol"."id", "per"."id"
        FROM "Role" "rol" CROSS JOIN "Permission" "per"
        WHERE "rol"."name" = '${roleHasPermissions.brand.name}' 
            AND "per"."action" IN (${this.convertArrToString(roleHasPermissions.brand.permissions)});
        `);
    }

    private async seedFarm(queryRunner: QueryRunner) {
        await queryRunner.query(`
        INSERT INTO "RoleHasPermission" ("roleId", "permissionId")
        SELECT "rol"."id", "per"."id"
        FROM "Role" "rol" CROSS JOIN "Permission" "per"
        WHERE "rol"."name" = '${roleHasPermissions.farm.name}' 
            AND "per"."action" IN (${this.convertArrToString(roleHasPermissions.farm.permissions)});

        UPDATE "RoleHasPermission"
        SET "metadata" = '{"transportTo": ["3ba6f58d-5522-40a1-9442-2caceebca357"]}'
        FROM "RoleHasPermission" "rhp"
        INNER JOIN "Role" "rol" ON "rhp"."roleId" = "rol"."id"
        INNER JOIN "Permission" "per" ON "rhp"."permissionId" = "per"."id"
        WHERE "rol"."name" = '${roleHasPermissions.farm.name}' and "per"."action" = 'LOG_TRANSPORT'
            AND "RoleHasPermission"."id" = "rhp"."id";
        `);
    }

    private async seedGinner(queryRunner: QueryRunner) {
        await queryRunner.query(`
        INSERT INTO "RoleHasPermission" ("roleId", "permissionId")
        SELECT "rol"."id", "per"."id"
        FROM "Role" "rol" CROSS JOIN "Permission" "per"
        WHERE "rol"."name" = '${roleHasPermissions.ginner.name}' 
            AND "per"."action" IN (${this.convertArrToString(roleHasPermissions.ginner.permissions)});


        UPDATE "RoleHasPermission"
        SET "metadata" = '{"purchaseFrom": ["43484404-1239-4ede-bd3e-2a8808f5d96d", "8f356b17-cdf7-4ff9-8cc5-8f41041b3fcb"]}'
        FROM "RoleHasPermission" "rhp"
        INNER JOIN "Role" "rol" ON "rhp"."roleId" = "rol"."id"
        INNER JOIN "Permission" "per" ON "rhp"."permissionId" = "per"."id"
        WHERE "rol"."name" = '${roleHasPermissions.ginner.name}' and "per"."action" = 'LOG_PURCHASES'
            AND "RoleHasPermission"."id" = "rhp"."id";

        UPDATE "RoleHasPermission"
        SET "metadata" = '{"sellTo": ["0dc62cd0-2539-452c-9050-0110feed9060", "8f356b17-cdf7-4ff9-8cc5-8f41041b3fcb"]}'
        FROM "RoleHasPermission" "rhp"
        INNER JOIN "Role" "rol" ON "rhp"."roleId" = "rol"."id"
        INNER JOIN "Permission" "per" ON "rhp"."permissionId" = "per"."id"
        WHERE "rol"."name" = '${roleHasPermissions.ginner.name}' and "per"."action" = 'LOG_SALE'
            AND "RoleHasPermission"."id" = "rhp"."id";

        UPDATE "RoleHasPermission"
        SET "metadata" = '{"transportTo": ["3ba6f58d-5522-40a1-9442-2caceebca357"]}'
        FROM "RoleHasPermission" "rhp"
        INNER JOIN "Role" "rol" ON "rhp"."roleId" = "rol"."id"
        INNER JOIN "Permission" "per" ON "rhp"."permissionId" = "per"."id"
        WHERE "rol"."name" = '${roleHasPermissions.ginner.name}' and "per"."action" = 'LOG_TRANSPORT'
            AND "RoleHasPermission"."id" = "rhp"."id";
        `);
    }

    private async seedSpinner(queryRunner: QueryRunner) {
        await queryRunner.query(`
        INSERT INTO "RoleHasPermission" ("roleId", "permissionId")
        SELECT "rol"."id", "per"."id"
        FROM "Role" "rol" CROSS JOIN "Permission" "per"
        WHERE "rol"."name" = '${roleHasPermissions.spinner.name}' 
            AND "per"."action" IN (${this.convertArrToString(roleHasPermissions.spinner.permissions)});

        UPDATE "RoleHasPermission"
        SET "metadata" = '{"purchaseFrom": ["e6be1a55-26f0-4fc9-ac27-6cc51f0dc0e5", "8f356b17-cdf7-4ff9-8cc5-8f41041b3fcb"]}'
        FROM "RoleHasPermission" "rhp"
        INNER JOIN "Role" "rol" ON "rhp"."roleId" = "rol"."id"
        INNER JOIN "Permission" "per" ON "rhp"."permissionId" = "per"."id"
        WHERE "rol"."name" = '${roleHasPermissions.spinner.name}' and "per"."action" = 'LOG_PURCHASES'
            AND "RoleHasPermission"."id" = "rhp"."id";

        UPDATE "RoleHasPermission"
        SET "metadata" = '{"sellTo": ["5e429ca1-1a7f-42dc-b9f8-733caded03fe", "8f356b17-cdf7-4ff9-8cc5-8f41041b3fcb"]}'
        FROM "RoleHasPermission" "rhp"
        INNER JOIN "Role" "rol" ON "rhp"."roleId" = "rol"."id"
        INNER JOIN "Permission" "per" ON "rhp"."permissionId" = "per"."id"
        WHERE "rol"."name" = '${roleHasPermissions.spinner.name}' and "per"."action" = 'LOG_SALE'
            AND "RoleHasPermission"."id" = "rhp"."id";

        UPDATE "RoleHasPermission"
        SET "metadata" = '{"transportTo": ["3ba6f58d-5522-40a1-9442-2caceebca357"]}'
        FROM "RoleHasPermission" "rhp"
        INNER JOIN "Role" "rol" ON "rhp"."roleId" = "rol"."id"
        INNER JOIN "Permission" "per" ON "rhp"."permissionId" = "per"."id"
        WHERE "rol"."name" = '${roleHasPermissions.spinner.name}' and "per"."action" = 'LOG_TRANSPORT'
            AND "RoleHasPermission"."id" = "rhp"."id";
        `);
    }

    private async seedMill(queryRunner: QueryRunner) {
        await queryRunner.query(`
        INSERT INTO "RoleHasPermission" ("roleId", "permissionId")
        SELECT "rol"."id", "per"."id"
        FROM "Role" "rol" CROSS JOIN "Permission" "per"
        WHERE "rol"."name" = '${roleHasPermissions.mill.name}' 
            AND "per"."action" IN (${this.convertArrToString(roleHasPermissions.mill.permissions)});

        UPDATE "RoleHasPermission"
        SET "metadata" = '{"purchaseFrom": ["0dc62cd0-2539-452c-9050-0110feed9060", "8f356b17-cdf7-4ff9-8cc5-8f41041b3fcb"]}'
        FROM "RoleHasPermission" "rhp"
        INNER JOIN "Role" "rol" ON "rhp"."roleId" = "rol"."id"
        INNER JOIN "Permission" "per" ON "rhp"."permissionId" = "per"."id"
        WHERE "rol"."name" = '${roleHasPermissions.mill.name}' and "per"."action" = 'LOG_PURCHASES'
            AND "RoleHasPermission"."id" = "rhp"."id";   
        
        UPDATE "RoleHasPermission"
        SET "metadata" = '{"transportTo": ["3ba6f58d-5522-40a1-9442-2caceebca357"]}'
        FROM "RoleHasPermission" "rhp"
        INNER JOIN "Role" "rol" ON "rhp"."roleId" = "rol"."id"
        INNER JOIN "Permission" "per" ON "rhp"."permissionId" = "per"."id"
        WHERE "rol"."name" = '${roleHasPermissions.mill.name}' and "per"."action" = 'LOG_TRANSPORT'
            AND "RoleHasPermission"."id" = "rhp"."id";
        `);
    }

    private async seedFarmMonitor(queryRunner: QueryRunner) {
        await queryRunner.query(`
        INSERT INTO "RoleHasPermission" ("roleId", "permissionId")
        SELECT "rol"."id", "per"."id"
        FROM "Role" "rol" CROSS JOIN "Permission" "per"
        WHERE "rol"."name" = '${roleHasPermissions.farmMonitor.name}' 
            AND "per"."action" IN (${this.convertArrToString(roleHasPermissions.farmMonitor.permissions)});

        INSERT INTO "RoleHasPermission" ("roleId", "permissionId")
        SELECT "rol"."id", "per"."id"
        FROM "Role" "rol" CROSS JOIN "Permission" "per"
        WHERE "rol"."name" = '${roleHasPermissions.farmMonitorWeb.name}' 
            AND "per"."action" IN (${this.convertArrToString(roleHasPermissions.farmMonitorWeb.permissions)});
        `);
    }
}
