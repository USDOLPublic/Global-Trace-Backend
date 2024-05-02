import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnRiskDataToFacilityTable1701229698725 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.jsonb('riskData').default("'{}'::jsonb");
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.dropColumn('riskData');
        });
    }
}
