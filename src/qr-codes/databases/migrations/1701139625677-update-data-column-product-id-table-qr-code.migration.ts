import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateDataColumnProductIdTableQrCode1701139625677 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`
            UPDATE "QrCode"
            SET "productId" = "lotId";
        `);

        await this.update('QrCode', (table) => {
            table.dropColumn('lotId');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('QrCode', (table) => {
            table.uuid('lotId').nullable().index().foreign('Lot');
        });
    }
}
