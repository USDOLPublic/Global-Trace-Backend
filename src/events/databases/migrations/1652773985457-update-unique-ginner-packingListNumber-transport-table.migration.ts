import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateUniqueGinnerPackingListNumberTransportTable1652773985457 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_Unique_fromFacilityId_packingListNumber";`
        );

        await queryRunner.query(
            'CREATE UNIQUE INDEX Transaction_Unique_packingListNumber ON "Transaction" ("fromFacilityId", "packingListNumber") WHERE ("type" != 3);'
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(
            'ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_Unique_fromFacilityId_packingListNumber" UNIQUE ("fromFacilityId", "packingListNumber");'
        );
        await queryRunner.query('DROP INDEX IF EXISTS "Transaction_Unique_packingListNumber"');
    }
}
