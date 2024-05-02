import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnContactPhoneNumberTableFarmProfile1653993605800 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('FarmProfile', (table) => {
            table.string('contactPhoneNumber').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('FarmProfile', (table) => {
            table.dropColumn('contactPhoneNumber');
        });
    }
}
