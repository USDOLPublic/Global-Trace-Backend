import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnDeletedAtToRoleTable1687925253800 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Role', (table) => {
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Role', (table) => {
            table.dropColumn('deletedAt');
        });
    }
}
