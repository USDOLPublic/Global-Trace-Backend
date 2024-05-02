import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AlterCountryIdToCountryIdsToBusinessDetailTable1698910800743 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('BusinessDetail', (table) => {
            table.dropColumn('countryId');
            table.strings('countryIds').default('array[]::varchar[]');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('BusinessDetail', (table) => {
            table.string('countryId');
            table.dropColumn('countryIds');
        });
    }
}
