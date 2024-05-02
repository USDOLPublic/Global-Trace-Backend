import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateFacilityAddUploadLogoFieldTable1649151821489 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.string('logo').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.dropColumn('logo');
        });
    }
}
