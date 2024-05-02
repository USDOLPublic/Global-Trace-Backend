import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import format from 'pg-format';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import indicators from '../data/indicators.json';

export class UpdateIndicatorsAndSubIndicators1688977467630 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await queryRunner.manager.query('ALTER TABLE "Category" ALTER "name" TYPE text;');

        const existingIndicators = await this.getExistingIndicators(queryRunner);

        for (const { name, subIndicators } of indicators) {
            const indicator = existingIndicators.find((existingIndicator) => existingIndicator.name === name);
            if (indicator) {
                const existingSubIndicators = await this.getExistingSubIndicators(queryRunner, indicator.id);
                const existingSubIndicatorNames = existingSubIndicators.map(
                    (existingSubIndicator) => existingSubIndicator.name
                );

                const deletedSubIndicatorNames = existingSubIndicatorNames.filter(
                    (subIndicatorName) => !subIndicators.includes(subIndicatorName)
                );
                if (deletedSubIndicatorNames.length) {
                    await this.deleteSubIndicator(queryRunner, indicator.id, deletedSubIndicatorNames);
                }

                const newSubIndicatorNames = subIndicators.filter(
                    (subIndicator) => !existingSubIndicatorNames.includes(subIndicator)
                );
                if (newSubIndicatorNames.length) {
                    await this.insertSubIndicator(queryRunner, indicator.id, newSubIndicatorNames);
                }
            } else {
                const indicatorId = await this.insertIndicator(queryRunner, [name, CategoryTypeEnum.INDICATOR]);

                await this.insertSubIndicator(queryRunner, indicatorId, subIndicators);
            }
        }
    }

    private async getExistingIndicators(queryRunner: QueryRunner) {
        return queryRunner.query(`SELECT "id", "name" FROM "Category" WHERE "type" = $1`, [CategoryTypeEnum.INDICATOR]);
    }

    private async getExistingSubIndicators(queryRunner: QueryRunner, indicatorId: string) {
        return queryRunner.query(`SELECT "id", "name" FROM "Category" WHERE "type" = $1 AND "parentId" = $2`, [
            CategoryTypeEnum.SUB_INDICATOR,
            indicatorId
        ]);
    }

    private async insertIndicator(queryRunner: QueryRunner, insertData: any[]): Promise<string> {
        const sql = format('INSERT INTO "Category" ("name", "type") VALUES (%L) RETURNING "id"', insertData);
        const [{ id }] = await queryRunner.query(sql);
        return id;
    }

    private async insertSubIndicator(
        queryRunner: QueryRunner,
        indicatorId: string,
        subIndicators: string[]
    ): Promise<void> {
        const insertData = subIndicators.map((name) => [indicatorId, name, CategoryTypeEnum.SUB_INDICATOR]);

        const sql = format('INSERT INTO "Category" ("parentId", "name", "type") VALUES %L', insertData);
        await queryRunner.query(sql);
    }

    private async deleteSubIndicator(
        queryRunner: QueryRunner,
        indicatorId: string,
        subIndicators: string[]
    ): Promise<void> {
        const sql = format(
            'DELETE FROM "Category" WHERE "type" = %L AND "parentId" = %L AND "name" IN (%L)',
            CategoryTypeEnum.SUB_INDICATOR,
            indicatorId,
            subIndicators
        );
        await queryRunner.query(sql);
    }
}
