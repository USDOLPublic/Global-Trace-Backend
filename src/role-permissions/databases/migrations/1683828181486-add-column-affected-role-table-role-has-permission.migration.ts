import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class AddColumnAffectedRoleTableRoleHasPermission1683828181486 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('RoleHasPermission', (table) => {
            table.jsonb('metadata').nullable();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('RoleHasPermission', (table) => {
            table.dropColumn('metadata');
        });
    }
}
