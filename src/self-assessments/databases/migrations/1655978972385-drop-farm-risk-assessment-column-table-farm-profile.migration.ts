import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class DropFarmRiskAssessmentColumnTableFarmProfile1655978972385 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('FarmProfile', (table) => {
            table.dropColumn('farmRiskAssessments');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('FarmProfile', (table) => {
            table.jsonb('farmRiskAssessments').default("'{}'::jsonb");
        });
    }
}
