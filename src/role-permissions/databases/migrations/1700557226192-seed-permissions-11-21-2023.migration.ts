import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import permission from '~role-permissions/databases/data/permissions-11-21-2023.json';
import format from 'pg-format';

export class SeedPermissions112120231700557226192 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.updatePermissions(queryRunner);
        await this.insertNewPermission(queryRunner);
    }

    async updatePermissions(queryRunner: QueryRunner) {
        await queryRunner.query(
            `UPDATE "Permission" 
            SET "groupType" = 'CHECKBOX_GROUP' 
            WHERE "id" = '1c055d14-eea1-4b60-9b7d-c34ea2db9e7e';

            UPDATE "Permission"
            SET "sortOrder" = "sortOrder" + 1
            WHERE "sortOrder" > 25;
            `
        );
    }

    async insertNewPermission(queryRunner: QueryRunner) {
        const query =
            'INSERT INTO "Permission" ("id", "groups", "action", "name", "parentId", "sortOrder") VALUES (%L)';
        const sql = format(query, Object.values(permission));

        await queryRunner.query(sql);
    }
}
