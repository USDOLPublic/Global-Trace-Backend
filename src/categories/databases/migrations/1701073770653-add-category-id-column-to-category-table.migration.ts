import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import format from 'pg-format';
import { groupBy, keyBy } from 'lodash';

export class AddCategoryIdColumnToCategoryTable1701073770653 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.update('Category', (table) => {
            table.uuid('categoryId').nullable().index().foreign('Category');
        });
        await this.handleUpdatingCategories(queryRunner);
        await this.update('Category', (table) => {
            table.dropColumn('category');
        });
    }

    private async handleUpdatingCategories(queryRunner: QueryRunner) {
        const existingIndicators = await this.getExistingIndicators(queryRunner);
        const groupedCategories = groupBy(existingIndicators, 'category');
        const dataCategoriesInsert = Object.keys(groupedCategories).map((name) => [
            name,
            CategoryTypeEnum.CATEGORY,
            { en: name }
        ]);
        await this.insertCategories(queryRunner, dataCategoriesInsert);
        const categories = await this.getCategories(queryRunner);
        const categoriesKeyName = keyBy(categories, 'name');
        for (const item of existingIndicators) {
            const categoryId = categoriesKeyName[item.category].id;
            this.updateCategory(queryRunner, [categoryId, item.id]);
        }
    }

    private async getExistingIndicators(queryRunner: QueryRunner) {
        return queryRunner.query(`SELECT * FROM "Category" WHERE "type" = $1 OR "type" = $2`, [
            CategoryTypeEnum.INDICATOR,
            CategoryTypeEnum.SUB_INDICATOR
        ]);
    }

    private async getCategories(queryRunner: QueryRunner) {
        return queryRunner.query(`SELECT "id", "name" FROM "Category" WHERE "type" = $1`, [CategoryTypeEnum.CATEGORY]);
    }

    private async insertCategories(queryRunner: QueryRunner, insertData: any[][]): Promise<void> {
        const sql = format('INSERT INTO "Category" ("name", "type", "translation") VALUES %L', insertData);
        await queryRunner.query(sql);
    }

    private async updateCategory(queryRunner: QueryRunner, updateData: any[]): Promise<void> {
        await queryRunner.query('UPDATE "Category" SET "categoryId" = $1 WHERE "id" = $2', updateData);
    }
}
