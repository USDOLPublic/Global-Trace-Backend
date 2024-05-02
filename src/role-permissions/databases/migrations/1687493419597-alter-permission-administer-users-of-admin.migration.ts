import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterPermissionAdministerUsersOfAdmin1687493419597 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`
            UPDATE "RoleHasPermission"
            SET "metadata" = '{"exclusiveRoles": ["30d0f8b0-0477-40ef-a563-83f739e67b7e"]}'::jsonb
            WHERE "roleId" = '659e0ed0-f547-4d56-b15e-a723a908c91e' AND "permissionId" = '9e3c3f8d-c1f4-4e19-a389-b62d570e64e8'
        `);
    }
}
