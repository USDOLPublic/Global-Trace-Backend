import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateFarmGroupProfileTableMigration1653551639655 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('FarmGroupProfile', (table) => {
            table.primaryUuid('id');
            table.uuid('facilityId').index().foreign('Facility');
            table.string('farmGroupId').unique();
            table.jsonb('areas').default("'[]'::jsonb");
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('FarmGroupProfile');
    }
}
