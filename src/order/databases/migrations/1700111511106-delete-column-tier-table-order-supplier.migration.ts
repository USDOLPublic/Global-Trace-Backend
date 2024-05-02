import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class DeleteColumnTierTableOrderSupplier1700111511106 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('OrderSupplier', (table) => {
            table.dropColumn('tier');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('OrderSupplier', (table) => {
            table.string('tier');
        });
    }
}
