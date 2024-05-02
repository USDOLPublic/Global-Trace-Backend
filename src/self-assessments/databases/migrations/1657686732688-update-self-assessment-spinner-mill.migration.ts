import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { ImportUtil } from '../import/import.util';
import { FacilityTypeEnum } from '~facilities/enums/facility-type.enum';

export class UpdateSelfAssessmentSpinnerMill1657686732688 extends BaseMigration {
    paths = ['spinner/part-2.json', 'mill/part-2.json'];

    async run(queryRunner: QueryRunner) {
        for (const path of this.paths) {
            await ImportUtil.addTemplates(queryRunner, `self-assessments/databases/data/${path}`);
        }

        await this.removeQuestion(queryRunner, '01bf9103-9053-4107-bcb3-3064d23b2b7e');

        await this.updateSaqTotalQuestion(queryRunner);
    }

    private removeQuestion(queryRunner: QueryRunner, id: string) {
        return queryRunner.query(`DELETE FROM "SelfAssessmentQuestion" WHERE "id" = $1`, [id]);
    }

    private updateSaqTotalQuestion(queryRunner: QueryRunner) {
        return queryRunner.query(
            `UPDATE "SelfAssessment" SET "totalQuestions" = 28 FROM "Facility" WHERE "SelfAssessment"."forFacilityId" = "Facility"."id" AND "Facility"."type" = $1`,
            [FacilityTypeEnum.SPINNER]
        );
    }
}
