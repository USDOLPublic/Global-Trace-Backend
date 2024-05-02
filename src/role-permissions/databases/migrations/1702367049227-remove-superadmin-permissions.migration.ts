import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import format from 'pg-format';

export class RemoveSuperadminPermissions1702367049227 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const roleId = '30d0f8b0-0477-40ef-a563-83f739e67b7e';
        const permissionIds = [
            '82901b8a-5950-4e86-93db-088a7f14684e',
            'b57fbc21-7c2a-40ab-bf3a-e53a8231b4d7',
            'd2d10b21-39a0-45c7-839f-09c98f157dec',
            '0e6965d7-100f-41a6-9f61-041b01b78fc9',
            'd9f9a0db-859f-4b52-9374-aa1ec32a0cf0',
            '2bfcf3e0-756d-41eb-904f-5b9f6579c515'
        ];
        const sql = format(
            'DELETE FROM "RoleHasPermission" WHERE "roleId" = %L and "permissionId" IN (%L)',
            roleId,
            permissionIds
        );
        await queryRunner.query(sql);
    }
}
