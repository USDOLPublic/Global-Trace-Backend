import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateFieldDnaTestingTable1659670219118 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`ALTER TABLE "DnaTesting" RENAME COLUMN "requestFaciltityId" TO "requestFacilityId";`);
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('DnaTesting', (table) => {
            table.dropColumn('requestFacilityId');
        });
    }
}
