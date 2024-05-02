import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddPermissionSiteSettingsForAdmin1689008341456 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`
            INSERT INTO "RoleHasPermission" ("roleId", "permissionId")
            VALUES ('30d0f8b0-0477-40ef-a563-83f739e67b7e', '5d5b5c42-1ec6-41e0-a9e5-1893f2a6ef03')
        `);
    }
}
