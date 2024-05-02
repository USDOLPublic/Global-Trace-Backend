import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateEventTable1649047840601 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Event', (table) => {
            table.primaryUuid('id');
            table.uuid('facilityId').index().foreign('Facility');
            table.integer('type');
            table.timestamp('recordedAt');
            table.uuid('entityId');
            table.string('entityType');
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Event');
    }
}
