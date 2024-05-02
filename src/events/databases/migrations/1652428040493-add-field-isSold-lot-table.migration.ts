import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddFieldIsSoldLotTable1652428040493 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.boolean('isSold').default(false);
            table.boolean('isPurchased').default(false);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.dropColumn('isSold');
            table.dropColumn('isPurchased');
        });
    }
}
