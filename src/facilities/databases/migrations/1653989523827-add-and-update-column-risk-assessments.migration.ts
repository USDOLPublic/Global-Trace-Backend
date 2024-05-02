import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddAndUpdateColumnRiskAssessments1653989523827 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "FarmProfile" RENAME COLUMN "lat" TO "latitude";
                   ALTER TABLE "FarmProfile" RENAME COLUMN "lng" TO "longitude";
                   ALTER TABLE "FarmProfile" ALTER "latitude" TYPE VARCHAR(255);
                   ALTER TABLE "FarmProfile" ALTER "longitude" TYPE VARCHAR(255);`
        );

        await this.update('FarmProfile', (table) => {
            table.jsonb('farmRiskAssessments').default("'{}'::jsonb");
        });

        await queryRunner.query(
            `ALTER TABLE "FarmGroupProfile" RENAME COLUMN "communityRisk" TO "communityRiskAssessments"`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('FarmProfile', (table) => {
            table.dropColumn('farmRiskAssessments');
        });
    }
}
