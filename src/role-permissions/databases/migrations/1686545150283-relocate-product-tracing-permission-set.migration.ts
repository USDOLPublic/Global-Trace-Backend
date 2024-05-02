import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RelocateProductTracingPermissionSet1686545150283 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`
        UPDATE "Permission"
        SET "set" = 1
        WHERE "action" = 'LOG_PURCHASES';

        UPDATE "Permission"
        SET "set" = 2
        WHERE "action" = 'LOG_SALE';

        UPDATE "Permission"
        SET "set" = 3
        WHERE "action" IN ('USE_SYNTHETIC_DNA', 'USE_QR_CODE', 'USE_BARCODE');

        UPDATE "Permission"
        SET "set" = 4
        WHERE "action" IN ('LOG_TRANSFORMATIONS', 'LOG_TRANSPORT', 'LOG_BY_PRODUCT');

    `);
    }
}
