import { BaseMigration } from '@diginexhk/typeorm-helper';
import { QueryRunner } from 'typeorm';

export class AddColumnUpdatedAtCreatedAtTablePermission1683876342297 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Permission', (table) => {
            table.integer('set').default(0);
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Permission', (table) => {
            table.dropColumn('set');
            table.dropColumn('createdAt');
            table.dropColumn('updatedAt');
        });
    }
}
