import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RemoveOldSelfAssessmentGroup1703735343064 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentGroup', (table) => {
            table.dropColumn('forRole');
        });

        await queryRunner.manager.query('DELETE FROM "SelfAssessmentGroup" WHERE "roleId" IS NULL');
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('SelfAssessmentGroup', (table) => {
            table.string('forRole').nullable();
        });
    }
}
