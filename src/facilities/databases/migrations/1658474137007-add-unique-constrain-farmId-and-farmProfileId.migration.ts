import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddUniqueConstrainFarmIdAndFarmProfileId1658474137007 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`
            DELETE FROM "FarmProfile" 
                WHERE "id" IN (SELECT "id"
                    FROM (SELECT "id", ROW_NUMBER() OVER( PARTITION BY "farmId", "farmProfileId" ORDER BY  "farmId") AS row_num
                FROM "FarmProfile") t
            WHERE t.row_num > 1)`);

        await queryRunner.query(
            'ALTER TABLE "FarmProfile" ADD CONSTRAINT "FarmProfile_Unique_farmId_farmProfileId" UNIQUE ("farmId", "farmProfileId");'
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "FarmProfile" DROP CONSTRAINT "FarmProfile_Unique_farmId_farmProfileId";`);
    }
}
