import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddConstraintUniqueToTransactionTable1646760594467 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "Transaction"
            ADD CONSTRAINT "Transaction_Unique_toFacilityId_purchaseOrderNumber" UNIQUE ("toFacilityId", "purchaseOrderNumber"),
            ADD CONSTRAINT "Transaction_Unique_fromFacilityId_invoiceNumber" UNIQUE ("fromFacilityId", "invoiceNumber"),
            ADD CONSTRAINT "Transaction_Unique_fromFacilityId_packingListNumber" UNIQUE ("fromFacilityId", "packingListNumber");`
        );
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query(
            `ALTER TABLE "Transaction" 
            DROP CONSTRAINT "Transaction_Unique_toFacilityId_purchaseOrderNumber",
            DROP CONSTRAINT "Transaction_Unique_fromFacilityId_invoiceNumber",
            DROP CONSTRAINT "Transaction_Unique_fromFacilityId_packingListNumber";`
        );
    }
}
