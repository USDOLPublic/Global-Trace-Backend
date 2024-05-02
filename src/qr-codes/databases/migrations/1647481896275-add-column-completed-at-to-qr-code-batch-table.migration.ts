import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnCompletedAtToQrCodeBatchTable1647481896275 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('QrCodeBatch', (table) => {
            table.timestamp('completedAt').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('QrCodeBatch', (table) => {
            table.dropColumn('completedAt');
        });
    }
}
