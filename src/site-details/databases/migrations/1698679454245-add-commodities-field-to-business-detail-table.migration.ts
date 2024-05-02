import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddCommoditiesFieldToBusinessDetailTable1698679454245 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('BusinessDetail', (table) => {
            table.strings('commodities').default('array[]::varchar[]');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('BusinessDetail', (table) => {
            table.dropColumn('commodities');
        });
    }
}
