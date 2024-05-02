import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { ImportUtil } from '../import/import.util';

export class UpdateSelfAssessmentAllRole1657015164877 extends BaseMigration {
    paths = [
        'ginner/part-2.json',
        'ginner/part-3.json',
        'spinner/part-2.json',
        'spinner/part-3.json',
        'mill/part-2.json',
        'mill/part-3.json',
        'farm/part-3.json',
        'farm/part-4.json'
    ];

    part2 = 'self-assessments/databases/data/spinner/part-3.json';
    part3 = 'self-assessments/databases/data/spinner/part-3.json';

    async run(queryRunner: QueryRunner) {
        for (const path of this.paths) {
            await ImportUtil.addTemplates(queryRunner, `self-assessments/databases/data/${path}`);
        }
    }
}
