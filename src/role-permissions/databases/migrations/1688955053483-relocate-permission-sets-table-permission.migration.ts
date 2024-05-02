import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RelocatePermissionSetsTablePermission1688955053483 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.query(`
            UPDATE "Permission"
            SET "set" = 6
            WHERE "action"='RESPOND_TO_REQUESTS';
            
            UPDATE "Permission"
            SET "set" = 7
            WHERE "action" IN ('VIEW_LIMITED_AUDIT_REPORT_DETAILS', 'VIEW_COMPLETE_LABOR_MONITOR_DETAILS', 'VIEW_LIMITED_LABOR_MONITOR_DETAILS');
        `);
    }
}
