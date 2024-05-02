import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableSupplyChainNode1693838413993 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('SupplyChainNode', (table) => {
            table.primaryUuid('id');
            table.uuid('roleId').index().foreign('Role');
            table.uuid('fromRoleId').nullable().index().foreign('Role');
            table.uuid('outputProductId').index().foreign('Product');
            table.jsonb('position').default("'{}'::jsonb");
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('SupplyChainNode');
    }
}
