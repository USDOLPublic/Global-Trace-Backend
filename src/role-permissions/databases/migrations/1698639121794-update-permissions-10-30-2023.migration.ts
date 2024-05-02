import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import permissions from '~role-permissions/databases/data/permissions-10-30-2023.json';
import format from 'pg-format';

export class UpdatePermissions103020231698639121794 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        permissions.forEach(async (permission) => {
            const sql = format(
                `
                UPDATE "Permission" 
                SET "action" = %L
                WHERE "id" = %L;
            `,
                permission.action,
                permission.id
            );

            await queryRunner.query(sql);
        });
    }
}
