import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateUserHasRoleTable1644979036929 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('UserHasRole', (table) => {
            table.primaryUuid('id');
            table.uuid('userId').index().foreign('User');
            table.uuid('roleId').index().foreign('Role');
            table.baseTime();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('UserHasRole');
    }
}
