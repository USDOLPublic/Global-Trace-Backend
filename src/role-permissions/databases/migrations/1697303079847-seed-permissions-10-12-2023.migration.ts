import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import permissions from '~role-permissions/databases/data/permissions-10-12-2023.json';
import format from 'pg-format';
import { omit } from 'lodash';

export class SeedPermissions101220231697303079847 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Permission', (table) => {
            table.string('label').nullable();
            table.string('groups').nullable();
            table.dropColumn('groupId');
        });

        await this.insertNewPermissions(queryRunner);
        await this.updatePermissions(queryRunner);
        await this.deletePermissions(queryRunner);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Permission', (table) => {
            table.dropColumn('label');
            table.dropColumn('groups');
            table.uuid('groupId').nullable().index().foreign('PermissionGroup');
        });
    }

    async insertNewPermissions(queryRunner: QueryRunner) {
        const newPermissions = permissions.filter(({ isNew }) => isNew);

        const query =
            'INSERT INTO "Permission" ("id", "groups", "isMultiple", "action", "name", "parentId", "sortOrder", "label") VALUES %L';
        const values = newPermissions.map((permission) => Object.values(omit(permission, ['isNew', 'isUpdated'])));
        const sql = format(query, values);

        await queryRunner.query(sql);
    }

    async updatePermissions(queryRunner: QueryRunner) {
        const updatedPermissions = permissions.filter(({ isUpdated }) => isUpdated);

        updatedPermissions.forEach(async (permission) => {
            const sql = format(
                `
                UPDATE "Permission" 
                SET "name" = %L, "action" = %L, "groups" = %L, "isMultiple" = %L, "sortOrder" = %L, "label" = %L 
                WHERE "id" = %L;
            `,
                permission.name,
                permission.action,
                permission.groups,
                permission.isMultiple,
                permission.sortOrder,
                permission.label,
                permission.id
            );

            await queryRunner.query(sql);
        });
    }

    async deletePermissions(queryRunner: QueryRunner) {
        await queryRunner.query(
            `DELETE FROM "Permission" WHERE "id" IN ('b8f08d77-e0b1-4a29-8e81-2a4c732a1019', 'c1c5e198-eaa5-4dbb-85b2-53bdc685d56c')`
        );
    }
}
