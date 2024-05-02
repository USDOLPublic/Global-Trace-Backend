import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddRoleIdToSelfAssessmentGroupTable1696318036807 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentGroup', (table) => {
            table.uuid('roleId').index().nullable().foreign('Role');
        });

        await queryRunner.manager.query(`ALTER TABLE "SelfAssessmentGroup" ALTER "forRole" DROP NOT NULL;`);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentGroup', (table) => {
            table.dropColumn('roleId');
        });

        await queryRunner.query('ALTER TABLE "SelfAssessmentGroup" ALTER "forRole" SET NOT NULL;');
    }
}
