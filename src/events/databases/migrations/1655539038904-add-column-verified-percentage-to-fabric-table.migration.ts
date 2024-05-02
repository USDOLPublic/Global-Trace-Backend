import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnVerifiedPercentageToFabricTable1655539038904 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Fabric', (table) => {
            table.decimal('verifiedPercentage').default(0);
            table.decimal('notVerifiedPercentage').default(0);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Fabric', (table) => {
            table.dropColumn('verifiedPercentage');
            table.dropColumn('notVerifiedPercentage');
        });
    }
}
