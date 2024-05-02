import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnIsSupplierToUserTable1649212078248 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('User', (table) => {
            table.boolean('isSupplier').default('false');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('User', (table) => {
            table.dropColumn('isSupplier');
        });
    }
}
