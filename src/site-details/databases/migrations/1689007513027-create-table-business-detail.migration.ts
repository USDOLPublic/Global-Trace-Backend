import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableBusinessDetail1689007513027 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('BusinessDetail', (table) => {
            table.primaryUuid('id');
            table.createdAt();
            table.updatedAt();
            table.string('sector');
            table.string('country');
        });

        await queryRunner.manager.query(`ALTER TABLE "BusinessDetail" ADD COLUMN "startDateOfSeason" DATE;`);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('BusinessDetail');
    }
}
