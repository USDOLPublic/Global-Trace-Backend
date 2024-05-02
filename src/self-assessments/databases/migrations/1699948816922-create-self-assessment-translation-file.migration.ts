import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateSelfAssessmentTranslationFile1699948816922 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('SelfAssessmentTranslationFile', (table) => {
            table.primaryUuid('id');
            table.jsonb('file').default("'{}'::jsonb");
            table.uuid('roleId').index().nullable().foreign('Role');
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('SelfAssessmentTranslationFile');
    }
}
