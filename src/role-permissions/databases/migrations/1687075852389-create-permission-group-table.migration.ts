import { BaseMigration } from '@diginexhk/typeorm-helper';
import format from 'pg-format';
import { QueryRunner } from 'typeorm';
import permissionGroups from '~role-permissions/databases/data/permission-groups-06-16-2023.json';
import { PermissionGroupType } from '~role-permissions/types/permission-group.type';

export class CreatePermissionGroupTable1687075852389 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('PermissionGroup', (table) => {
            table.primaryUuid('id');
            table.string('name');
            table.integer('sortOrder');
            table.createdAt();
            table.updatedAt();
        });

        await queryRunner.query(this.getInsertPermissionGroupQueryHelper(permissionGroups));
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('PermissionGroup');
    }

    private getInsertPermissionGroupQueryHelper(permissionGroupList: PermissionGroupType[]) {
        let query = 'INSERT INTO "PermissionGroup" ("id", "name", "sortOrder") VALUES %L';
        const values = permissionGroupList.map((permissionGroup) => Object.values(permissionGroup));
        return format(query, values);
    }
}
