import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnTypeToSelfAssessmentUploadFileTable1698047110345 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentUploadFile', (table) => {
            table.integer('type').index().nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentUploadFile', (table) => {
            table.dropColumn('type');
        });
    }
}
