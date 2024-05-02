import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';

export class CreateAttributeTable1692690144082 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Attribute', (table) => {
            table.primaryUuid('id');
            table.string('name');
            table.string('type').default(`'${FieldTypeEnum.OTHER}'`);
            table.string('category');
            table.jsonb('options').default("'[]'::jsonb");
            table.jsonb('nameTranslation').default("'{}'::jsonb");
            table.createdAt();
            table.updatedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Attribute');
    }
}
