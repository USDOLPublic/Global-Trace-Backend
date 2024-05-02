import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';

export class CreateCategoryTable1680161744598 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.create('Category', (table) => {
            table.primaryUuid('id');
            table.uuid('parentId').nullable().index().foreign('Category');
            table.string('name');
            table.integer('type');
            table.createdAt();
            table.updatedAt();
            table.deletedAt();
        });
    }

    async rollback(queryRunner: QueryRunner) {
        await this.drop('Category');
    }
}
