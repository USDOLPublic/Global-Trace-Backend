import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { ImportUtil } from '../import/import.util';

export class UpdateSelfAssessmentAllRole1657774594054 extends BaseMigration {
    paths = ['ginner/part-3.json', 'spinner/part-2.json', 'mill/part-2.json', 'mill/part-3.json', 'farm/part-3.json'];

    async run(queryRunner: QueryRunner) {
        for (const path of this.paths) {
            await ImportUtil.addTemplates(queryRunner, `self-assessments/databases/data/${path}`);
        }
    }
}
