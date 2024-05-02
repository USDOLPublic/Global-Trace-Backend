import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateFacilityTable1645027019065 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Facility', (table) => {
            table.primaryUuid('id');
            table.integer('type').index();
            table.string('name');
            table.string('address').nullable();
            table.string('district').nullable();
            table.string('province').nullable();
            table.string('country').nullable();
            table.string('traderName').nullable();
            table.string('certification').nullable();
            table.string('oarId', 50).nullable();
            table.string('businessRegisterNumber').nullable();
            table.string('chainOfCustody').nullable();
            table.timestamp('reconciliationStartAt').nullable();
            table.string('reconciliationDuration').nullable();
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Facility');
    }
}
