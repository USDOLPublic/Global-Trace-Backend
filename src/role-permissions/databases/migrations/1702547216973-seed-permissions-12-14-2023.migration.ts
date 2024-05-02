import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import format from 'pg-format';
import permission from '~role-permissions/databases/data/permissions-12-14-2023.json';

export class SeedPermissions121420231702547216973 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.updatePermissions(queryRunner);
        await this.insertNewPermission(queryRunner);
    }

    async updatePermissions(queryRunner: QueryRunner) {
        await queryRunner.query(
            `
            UPDATE "Permission"
            SET "sortOrder" = "sortOrder" + 1
            WHERE "sortOrder" > 41;
            `
        );
    }

    async insertNewPermission(queryRunner: QueryRunner) {
        const query =
            'INSERT INTO "Permission" ("id", "name", "action", "sortOrder", "groups", "groupType") VALUES (%L)';
        const sql = format(query, Object.values(permission));

        await queryRunner.query(sql);
    }
}
