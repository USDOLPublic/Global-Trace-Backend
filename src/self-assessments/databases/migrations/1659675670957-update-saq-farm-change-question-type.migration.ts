import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { ImportUtil } from '../import/import.util';

export class UpdateSaqFarmChangeQuestionType1659675670957 extends BaseMigration {
    paths = ['farm/part-3.json'];

    async run(queryRunner: QueryRunner) {
        for (const path of this.paths) {
            await ImportUtil.addTemplates(queryRunner, `self-assessments/databases/data/${path}`);
        }
    }
}
