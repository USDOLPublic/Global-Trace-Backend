import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateColumnSetTablePermission1686215549904 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`
            UPDATE "Permission"
            SET "set" = 4
            WHERE "action" = 'LOG_PURCHASES';

            UPDATE "Permission"
            SET "set" = 5
            WHERE "action" = 'LOG_SALE';

        `);
    }
}
