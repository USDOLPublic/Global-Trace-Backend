import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddSessionDurationFieldToBusinessDetailTable1698119116860 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('BusinessDetail', (table) => {
            table.string('sessionDuration').nullable();
        });

        await queryRunner.query(`UPDATE "BusinessDetail" SET "sessionDuration" = 12`);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('BusinessDetail', (table) => {
            table.dropColumn('sessionDuration');
        });
    }
}
