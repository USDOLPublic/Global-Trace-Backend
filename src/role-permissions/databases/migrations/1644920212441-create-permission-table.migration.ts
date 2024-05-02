import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreatePermissionTable1644920212441 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Permission', (table) => {
            table.primaryUuid('id');
            table.string('name');
            table.string('group').index();
            table.string('action');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Permission');
    }
}
