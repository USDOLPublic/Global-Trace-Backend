import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddFieldGoodsToFacilityTable1699597332329 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.strings('goods').default('array[]::varchar[]');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.dropColumn('goods');
        });
    }
}
