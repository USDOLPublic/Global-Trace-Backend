import { BaseMigration } from '@diginexhk/typeorm-helper';
import format from 'pg-format';
import { QueryRunner } from 'typeorm';
import permissionGroups from '~role-permissions/databases/data/permission-groups-08-14-2023.json';
import newPermissions from '~role-permissions/databases/data/permissions-08-14-2023.json';

export class AddSubPermissionTablePermission1693193020341 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query('DELETE FROM "PermissionGroup";');

        await this.update('Permission', (table) => {
            table.boolean('isMultiple').nullable();
            table.integer('sortOrder');
            table.uuid('parentId').nullable().index().foreign('Permission');
            table.dropColumn('set');
            table.dropColumn('setName');
        });

        await this.addNewPermissionGroups(queryRunner);
        await this.addNewPermissions(queryRunner);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Permission', (table) => {
            table.dropColumn('isMultiple');
            table.dropColumn('sortOrder');
            table.dropColumn('parentId');
            table.integer('set').default(0);
            table.string('setName').nullable();
        });
    }

    private async addNewPermissionGroups(queryRunner: QueryRunner): Promise<void> {
        let query = 'INSERT INTO "PermissionGroup" ("id", "name", "sortOrder") VALUES %L';
        const values = permissionGroups.map((permissionGroup) => Object.values(permissionGroup));
        const sql = format(query, values);

        await queryRunner.query(sql);
    }

    private async addNewPermissions(queryRunner: QueryRunner): Promise<void> {
        const query =
            'INSERT INTO "Permission" ("id", "groupId", "isMultiple", "action", "name", "parentId", "sortOrder") VALUES %L';
        const values = newPermissions.map((permission) => Object.values(permission));
        const sql = format(query, values);

        await queryRunner.query(sql);
    }
}
