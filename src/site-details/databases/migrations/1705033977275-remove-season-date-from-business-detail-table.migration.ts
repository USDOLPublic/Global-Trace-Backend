import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RemoveSeasonDateFromBusinessDetailTable1705033977275 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('BusinessDetail', (table) => {
            table.dropColumn('startDateOfSeason');
            table.dropColumn('sessionDuration');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "BusinessDetail" ADD COLUMN "startDateOfSeason" DATE;`);
        await this.update('BusinessDetail', (table) => {
            table.string('sessionDuration').nullable();
        });
    }
}
