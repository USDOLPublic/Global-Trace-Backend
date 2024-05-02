import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnFacilityIdToTransactionTable1648135199379 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Transaction', (table) => {
            table.uuid('facilityId').nullable().index().foreign('Facility');
        });

        await queryRunner.query(
            `UPDATE "Transaction"
            SET "facilityId" = "FacilityUser"."facilityId"
            FROM "FacilityUser"
            WHERE "Transaction"."creatorId" = "FacilityUser"."userId";`
        );

        await queryRunner.query('ALTER TABLE "Transaction" ALTER "facilityId" SET NOT NULL;');
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('Transaction', (table) => {
            table.dropColumn('facilityId');
        });
    }
}
