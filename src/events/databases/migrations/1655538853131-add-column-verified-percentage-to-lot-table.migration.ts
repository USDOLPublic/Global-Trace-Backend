import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnVerifiedPercentageToLotTable1655538853131 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.decimal('verifiedPercentage').default(0);
            table.decimal('notVerifiedPercentage').default(0);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Lot', (table) => {
            table.dropColumn('verifiedPercentage');
            table.dropColumn('notVerifiedPercentage');
        });
    }
}
