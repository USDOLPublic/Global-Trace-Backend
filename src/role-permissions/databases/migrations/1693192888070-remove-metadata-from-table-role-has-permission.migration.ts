import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class RemoveMetadataFromTableRoleHasPermission1693192888070 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('RoleHasPermission', (table) => {
            table.dropColumn('metadata');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('RoleHasPermission', (table) => {
            table.jsonb('metadata').nullable();
        });
    }
}
