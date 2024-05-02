import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateSelfAssessmentUploadFileTable1696475483427 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('SelfAssessmentUploadFile', (table) => {
            table.primaryUuid('id');
            table.jsonb('file').default("'{}'::jsonb");
            table.baseTime();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('SelfAssessmentUploadFile');
    }
}
