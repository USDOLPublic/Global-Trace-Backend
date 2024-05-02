import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableSelfAssessmentGroup1654643625380 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('SelfAssessmentGroup', (table) => {
            table.primaryUuid('id');
            table.uuid('parentGroupId').index().nullable().foreign('SelfAssessmentGroup');
            table.jsonb('title').default("'{}'::jsonb");
            table.integer('order');
            table.string('forRole');
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('SelfAssessmentGroup');
    }
}
