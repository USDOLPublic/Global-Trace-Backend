import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnVerifiedPercentageToYarnTable1655538958623 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Yarn', (table) => {
            table.decimal('verifiedPercentage').default(0);
            table.decimal('notVerifiedPercentage').default(0);
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Yarn', (table) => {
            table.dropColumn('verifiedPercentage');
            table.dropColumn('notVerifiedPercentage');
        });
    }
}
