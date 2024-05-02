import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { FacilityTypeEnum } from '~facilities/enums/facility-type.enum';

export class RemoveMillSaqQuestionMechanization1658478360036 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.removeQuestion(queryRunner, '54ae70b8-ad63-49d8-aecd-9630c82cd911');

        await this.updateSaqTotalQuestion(queryRunner);
    }

    private removeQuestion(queryRunner: QueryRunner, id: string) {
        return queryRunner.query(`DELETE FROM "SelfAssessmentQuestion" WHERE "id" = $1`, [id]);
    }

    private updateSaqTotalQuestion(queryRunner: QueryRunner) {
        return queryRunner.query(
            `UPDATE "SelfAssessment" SET "totalQuestions" = 28 FROM "Facility" WHERE "SelfAssessment"."forFacilityId" = "Facility"."id" AND "Facility"."type" = $1`,
            [FacilityTypeEnum.MILL]
        );
    }
}
