import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnProductIdTableQrCode1696165602147 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('QrCode', (table) => {
            table.uuid('productId').nullable().index().foreign('Product');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('QrCode', (table) => {
            table.dropColumn('productId');
        });
    }
}
