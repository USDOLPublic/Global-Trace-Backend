import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddSaqRiskScoreCalculatingColumns1660098938217 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.jsonb('riskLevel').default("'{}'::jsonb");
            table.decimal('overallRiskScore').nullable();
            table.string('overallRiskLevel').nullable().index();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.dropColumn('riskLevel');
            table.dropColumn('overallRiskScore');
            table.dropColumn('overallRiskLevel');
        });
    }
}
