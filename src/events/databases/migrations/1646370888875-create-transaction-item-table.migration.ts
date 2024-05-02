import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTransactionItemTable1646370888875 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('TransactionItem', (table) => {
            table.primaryUuid('id');
            table.uuid('transactionId').index().foreign('Transaction');
            table.uuid('entityId');
            table.string('entityType');
            table.createdAt();
            table.updatedAt();
        });

        await queryRunner.manager.query(
            'CREATE INDEX "TransactionItem_Index_entityId_entityType" ON "TransactionItem" ("entityId", "entityType");'
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('TransactionItem');
    }
}
