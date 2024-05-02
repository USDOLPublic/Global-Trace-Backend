import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateFarmGroupAndFarmRelationship1653619914184 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.dropColumn('certification');
            table.uuid('farmGroupId').index().nullable().foreign('Facility');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Facility', (table) => {
            table.string('certification');
            table.dropColumn('farmGroupId');
        });
    }
}
