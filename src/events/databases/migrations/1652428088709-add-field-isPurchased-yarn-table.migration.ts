import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddFieldIsPurchasedYarnTable1652428088709 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Yarn', (table) => {
            table.boolean('isPurchased').default(false);
            table.boolean('isSold').default(false);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Yarn', (table) => {
            table.dropColumn('isPurchased');
            table.dropColumn('isSold');
        });
    }
}
