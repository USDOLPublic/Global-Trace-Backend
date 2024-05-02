import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class DropColumnEntityTypeTableTransactionItem1700636569722 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('TransactionItem', (table) => {
            table.dropColumn('entityType');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('TransactionItem', (table) => {
            table.string('entityType').nullable();
        });
    }
}
