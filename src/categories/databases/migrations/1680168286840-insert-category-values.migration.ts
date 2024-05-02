import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import format from 'pg-format';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import indicators from '../data/indicators.json';

export class InsertCategoryValues1680168286840 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query('ALTER TABLE "Category" ALTER "name" TYPE text;');

        for (const { name, subIndicators } of indicators) {
            const indicatorId = await this.insertIndicator(queryRunner, [name, CategoryTypeEnum.INDICATOR]);

            const subIndicatorsData = subIndicators.map((subIndicator) => [
                indicatorId,
                subIndicator,
                CategoryTypeEnum.SUB_INDICATOR
            ]);
            await this.insertSubIndicator(queryRunner, subIndicatorsData);
        }
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query('DELETE FROM "Category"');
    }

    private async insertIndicator(queryRunner: QueryRunner, insertData: any[]): Promise<string> {
        const sql = format('INSERT INTO "Category" ("name", "type") VALUES (%L) RETURNING "id"', insertData);
        const [{ id }] = await queryRunner.query(sql);
        return id;
    }

    private async insertSubIndicator(queryRunner: QueryRunner, insertData: any[][]): Promise<void> {
        const sql = format('INSERT INTO "Category" ("parentId", "name", "type") VALUES %L', insertData);
        await queryRunner.query(sql);
    }
}
