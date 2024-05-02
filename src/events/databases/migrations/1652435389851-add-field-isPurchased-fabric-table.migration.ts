import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddFieldIsPurchasedFabricTable1652435389851 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Fabric', (table) => {
            table.boolean('isPurchased').default(false);
            table.boolean('isSold').default(false);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Fabric', (table) => {
            table.dropColumn('isPurchased');
            table.dropColumn('isSold');
        });
    }
}
