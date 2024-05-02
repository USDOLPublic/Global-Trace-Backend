import { BaseMigration } from '@diginexhk/typeorm-helper';
import { QueryRunner } from 'typeorm';

export class AddColumnGroupTableRole1683827897196 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Role', (table) => {
            table.string('type').nullable();
            table.jsonb('userInterfaces').nullable();
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Role', (table) => {
            table.dropColumn('type');
            table.dropColumn('userInterfaces');
            table.dropColumn('createdAt');
            table.dropColumn('updatedAt');
        });
    }
}
