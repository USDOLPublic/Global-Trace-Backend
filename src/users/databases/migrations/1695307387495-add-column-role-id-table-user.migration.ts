import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnRoleIdTableUser1695307387495 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('User', (table) => {
            table.uuid('roleId').nullable().index().foreign('Role');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('User', (table) => {
            table.dropColumn('roleId');
        });
    }
}
