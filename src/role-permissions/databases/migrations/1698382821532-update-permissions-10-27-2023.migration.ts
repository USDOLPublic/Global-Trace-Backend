import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import permissions from '~role-permissions/databases/data/permissions-10-27-2023.json';
import format from 'pg-format';

export class UpdatePermissions102720231698382821532 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        permissions.forEach(async (permission) => {
            const sql = format(
                `
                UPDATE "Permission" 
                SET "groups" = %L
                WHERE "id" = %L;
            `,
                permission.groups,
                permission.id
            );

            await queryRunner.query(sql);
        });
    }
}
