import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateProductDefinitionTable1692330661117 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('ProductDefinition', (table) => {
            table.primaryUuid('id');
            table.string('name');
            table.jsonb('nameTranslation').default("'{}'::jsonb");
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('ProductDefinition');
    }
}
