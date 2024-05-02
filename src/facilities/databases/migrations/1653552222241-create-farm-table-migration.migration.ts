import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateFarmTableMigration1653552222241 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Farm', (table) => {
            table.primaryUuid('id');
            table.uuid('farmGroupId').index().foreign('Facility');
            table.string('farmId');
            table.string('name');
            table.string('tehsil').nullable();
            table.integer('lat');
            table.integer('lng');
            table.string('businessRegisterNumber').nullable();
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
        await this.drop('Farm');
    }
}
