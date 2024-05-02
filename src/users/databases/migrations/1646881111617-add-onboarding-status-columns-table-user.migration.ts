import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddOnboardingStatusColumnsTableUser1646881111617 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('User', (table) => {
            table.timestamp('updatedProfileAt').nullable();
            table.timestamp('answeredSaqAt').nullable();
            table.timestamp('addedPartnerAt').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('User', (table) => {
            table.dropColumn('updatedProfileAt');
            table.dropColumn('answeredSaqAt');
            table.dropColumn('addedPartnerAt');
        });
    }
}
