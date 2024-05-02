import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateTableAttributeFile1694960829117 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('AttributeFile', (table) => {
            table.primaryUuid('id');
            table.createdAt();
            table.updatedAt();
            table.boolean('isValidated').default(false);
            table.boolean('isImported').default(false);
            table.string('blobName');
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('AttributeFile');
    }
}
