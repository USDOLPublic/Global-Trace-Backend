import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class TruncateTableSelfAssessment1655366853173 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`DELETE FROM "SelfAssessment"`);
    }
}
