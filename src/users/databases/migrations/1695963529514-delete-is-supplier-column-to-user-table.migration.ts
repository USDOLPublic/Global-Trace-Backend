import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class DeleteIsSupplierColumnToUserTable1695963529514 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('User', (table) => {
            table.dropColumn('isSupplier');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('User', (table) => {
            table.boolean('isSupplier').default('false');
        });
    }
}
