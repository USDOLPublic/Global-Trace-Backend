import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnCompletedConfiguringSystemAtTableBusinessDetail1701847868649 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('BusinessDetail', (table) => {
            table.timestamp('completedConfiguringSystemAt').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('BusinessDetail', (table) => {
            table.dropColumn('completedConfiguringSystemAt');
        });
    }
}
