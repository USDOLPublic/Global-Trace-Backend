import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateRoleTable1644919103465 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Role', (table) => {
            table.primaryUuid('id');
            table.string('name');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Role');
    }
}
