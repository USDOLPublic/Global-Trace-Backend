import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateGrievanceReportTable1648463744390 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('GrievanceReport', (table) => {
            table.primaryUuid('id');
            table.uuid('facilityId').index().foreign('Facility');
            table.string('location');
            table.string('message');
            table.string('indicator');
            table.uuid('assigneeId').index().foreign('User');
            table.string('reason');
            table.integer('source');
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('GrievanceReport');
    }
}
