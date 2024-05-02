import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateQrCodeTable1647327779975 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('QrCode', (table) => {
            table.primaryUuid('id');
            table.uuid('qrCodeBatchId').index().foreign('QrCodeBatch');
            table.uuid('lotId').nullable().index().foreign('Lot');
            table.string('code');
            table.integer('status').default(1);
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });

        await queryRunner.query(
            'CREATE UNIQUE INDEX QrCode_Unique_Index_code ON "QrCode" ("code") WHERE ("deletedAt" IS NULL);'
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('QrCode');
    }
}
