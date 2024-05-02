import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateProductTable1692332721048 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Product', (table) => {
            table.primaryUuid('id');
            table.uuid('productDefinitionId').index().foreign('ProductDefinition');
            table.string('code').index().nullable();
            table.string('dnaIdentifier').nullable();
            table.decimal('verifiedPercentage').default(0);
            table.decimal('notVerifiedPercentage').default(0);
            table.boolean('isPurchased').default(false);
            table.boolean('isSold').default(false);
            table.boolean('isTransformed').default(false);
            table.boolean('isTransported').default(false);
            table.jsonb('additionalAttributes').default("'[]'::jsonb");
            table.uuid('createdFacilityId');
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Product');
    }
}
