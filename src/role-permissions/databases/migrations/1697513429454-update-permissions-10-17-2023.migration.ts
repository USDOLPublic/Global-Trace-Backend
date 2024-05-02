import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import permissions from '~role-permissions/databases/data/permissions-10-17-2023.json';
import format from 'pg-format';
import { omit } from 'lodash';

export class UpdatePermissions101720231697513429454 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Permission', (table) => {
            table.string('groupType').nullable();
            table.dropColumn('isMultiple');
        });

        this.updatePermissions(queryRunner);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Permission', (table) => {
            table.boolean('isMultiple').nullable();
            table.dropColumn('groupType');
        });
    }

    private async updatePermissions(queryRunner: QueryRunner) {
        permissions.forEach(async (permission) => {
            const parameters = Object.keys(omit(permission, ['id'])).map((key) => `"${key}" = %L`);
            const sql = format(
                `
                UPDATE "Permission" 
                SET ${parameters}
                WHERE "id" = %L;
            `,
                ...Object.values(permission)
            );

            await queryRunner.query(sql);
        });
    }
}
