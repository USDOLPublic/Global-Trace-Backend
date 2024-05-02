import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnTier1648450967764 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.string('tier').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.dropColumn('tier');
        });
    }
}
