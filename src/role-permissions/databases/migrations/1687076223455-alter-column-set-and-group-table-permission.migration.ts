import { BaseMigration } from '@diginexhk/typeorm-helper';
import format from 'pg-format';
import { QueryRunner } from 'typeorm';
import newPermissions from '~role-permissions/databases/data/permissions-06-19-2023.json';
import oldPermissions from '~role-permissions/databases/data/permissions-05-22-2023-v1.json';

export class AlterColumnSetAndGroupTablePermission1687076223455 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Permission', (table) => {
            table.dropColumn('group');
            table.string('setName').nullable();
            table.uuid('groupId').nullable().index().foreign('PermissionGroup');
        });

        await queryRunner.query(this.getUpdatePermissionQueryHelper(newPermissions));

        await this.updateTraceProduct(queryRunner);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Permission', (table) => {
            table.dropColumn('groupId');
            table.dropColumn('setName');
            table.string('group').index();
        });

        await queryRunner.query(this.getRollbackPermissionQueryHelper(oldPermissions));
    }

    private getUpdatePermissionQueryHelper(permissions) {
        const formattedPermissions = format(
            '%L',
            permissions.map((per) => [per.groupId, per.set, per.setName, per.id])
        );

        return `
            UPDATE "Permission" AS p
            SET "groupId" = v."groupId"::uuid,
                "set" = v."set"::integer,
                "setName" = v."setName"
            FROM (VALUES ${formattedPermissions}) AS v("groupId", "set", "setName", "id")
            WHERE p."id" = v."id"::uuid;
        `;
    }

    private getRollbackPermissionQueryHelper(permissions) {
        const formattedPermissions = format(
            '%L',
            permissions.map((per) => [per.group, per.set, per.id])
        );

        return `
            UPDATE "Permission" AS p
            SET "group" = v."group",
                "set" = v."set"::integer
            FROM (VALUES ${formattedPermissions}) AS v("group", "set", "id")
            WHERE p."id" = v."id"::uuid;
        `;
    }

    private async updateTraceProduct(queryRunner: QueryRunner) {
        await queryRunner.query(`DELETE FROM "Permission" WHERE "name" = 'Trace products';`);

        await queryRunner.query(`
            UPDATE "Permission" 
            SET name = 'Trace products', action = 'TRACE_PRODUCTS'
            WHERE name = 'Trace order';
        `);
    }
}
