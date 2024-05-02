import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateFarmProfileTableMigration1653619577282 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.drop('Farm');
        await this.create('FarmProfile', (table) => {
            table.primaryUuid('id');
            table.uuid('farmId').index().foreign('Facility');
            table.string('farmProfileId');
            table.string('tehsil').nullable();
            table.integer('lat');
            table.integer('lng');
            table.string('firstNameContactor');
            table.string('lastNameContactor');
            table.string('certification');
            table.timestamp('certificationExpiredDate');
            table.integer('farmSize');
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('FarmProfile');
    }
}
