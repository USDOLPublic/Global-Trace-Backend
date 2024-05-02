import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class UpdateOutputProductRelationInTableSupplyChainNode1696054079046 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('SupplyChainNode', (table) => {
            table.uuid('outputProductDefinitionId').index().foreign('ProductDefinition');
            table.dropColumn('outputProductId');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.update('SupplyChainNode', (table) => {
            table.uuid('outputProductId').index().foreign('Product');
            table.dropColumn('outputProductDefinitionId');
        });
    }
}
