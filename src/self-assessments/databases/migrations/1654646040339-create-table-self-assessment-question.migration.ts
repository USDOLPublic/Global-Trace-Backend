import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableSelfAssessmentQuestion1654646040339 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('SelfAssessmentQuestion', (table) => {
            table.primaryUuid('id');
            table.uuid('groupId').index().foreign('SelfAssessmentGroup');
            table.jsonb('title').default("'{}'::jsonb");
            table.integer('order');
            table.string('type');
            table.boolean('isRequired').default(false);
            table.jsonb('metadata').default("'{}'::jsonb");
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('SelfAssessmentQuestion');
    }
}
