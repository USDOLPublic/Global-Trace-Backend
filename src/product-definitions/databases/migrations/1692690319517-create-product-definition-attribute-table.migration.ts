import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateProductDefinitionAttributeTable1692690319517 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('ProductDefinitionAttribute', (table) => {
            table.primaryUuid('id');
            table.uuid('productDefinitionId').index().foreign('ProductDefinition');
            table.uuid('attributeId').index().foreign('Attribute');
            table.integer('order').default(1);
            table.boolean('isOptional').default(false);
            table.boolean('isAddManuallyOnly').default(false);
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('ProductDefinitionAttribute');
    }
}
