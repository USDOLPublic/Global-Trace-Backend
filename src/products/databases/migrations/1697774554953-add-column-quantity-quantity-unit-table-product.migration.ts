import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnQuantityQuantityUnitTableProduct1697774554953 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Product', (table) => {
            table.decimal('quantity').default(0);
            table.string('quantityUnit').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Product', (table) => {
            table.dropColumn('quantity');
            table.dropColumn('quantityUnit');
        });
    }
}
