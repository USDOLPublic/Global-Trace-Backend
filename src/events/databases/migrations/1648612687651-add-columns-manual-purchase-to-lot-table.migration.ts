import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnsManualPurchaseToLotTable1648612687651 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.decimal('price').default(0);
            table.string('currency').nullable();
            table.string('country').nullable();
            table.string('province').nullable();
            table.string('district').nullable();
            table.jsonb('uploadProofs').default("'{}'::jsonb");
            table.boolean('isManualAdded').default(false);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.dropColumn('price');
            table.dropColumn('currency');
            table.dropColumn('country');
            table.dropColumn('province');
            table.dropColumn('district');
            table.dropColumn('uploadProofs');
            table.dropColumn('isManualAdded');
        });
    }
}
