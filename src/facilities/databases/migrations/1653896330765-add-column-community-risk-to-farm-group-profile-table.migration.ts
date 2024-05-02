import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnCommunityRiskToFarmGroupProfileTable1653896330765 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('FarmGroupProfile', (table) => {
            table.jsonb('communityRisk').default("'{}'::jsonb");
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('FarmGroupProfile', (table) => {
            table.dropColumn('communityRisk');
        });
    }
}
