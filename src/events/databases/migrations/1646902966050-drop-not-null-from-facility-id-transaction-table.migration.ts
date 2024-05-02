import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class DropNotNullFromFacilityIdTransactionTable1646902966050 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "Transaction" ALTER "fromFacilityId" DROP NOT NULL;`);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.manager.query(`ALTER TABLE "Transaction" ALTER "fromFacilityId" SET NOT NULL;`);
    }
}
