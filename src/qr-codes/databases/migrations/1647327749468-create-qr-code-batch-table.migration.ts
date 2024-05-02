import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateQrCodeBatchTable1647327749468 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('QrCodeBatch', (table) => {
            table.primaryUuid('id');
            table.string('name');
            table.integer('quantity');
            table.integer('totalEncoded');
            table.integer('totalActive').default(0);
            table.integer('totalDispensed').default(0);
            table.uuid('creatorId').index().foreign('User');
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('QrCodeBatch');
    }
}
