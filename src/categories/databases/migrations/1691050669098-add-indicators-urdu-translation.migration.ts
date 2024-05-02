import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import indicatorTranslations from '../data/indicators-ur.json';
import subIndicatorTranslations from '../data/sub-indicators-ur.json';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import { keyBy } from 'lodash';
import format from 'pg-format';

export class AddIndicatorsUrduTranslation1691050669098 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        await this.removeSubIndicator(queryRunner);

        await this.addIndicatorTranslations(queryRunner);
        await this.addSubIndicatorTranslations(queryRunner);
    }

    private async removeSubIndicator(queryRunner: QueryRunner) {
        const removeSubIndicator =
            'Review process does not include corrective action management in a way that can mitigate risks with a mechanism to track indicators of improvement';
        const subIndicators = await queryRunner.query(
            `SELECT "id", "name" FROM "Category" WHERE "type" = $1 AND "name" = $2`,
            [CategoryTypeEnum.SUB_INDICATOR, removeSubIndicator]
        );
        if (subIndicators.length == 2) {
            await queryRunner.query('UPDATE "LaborRisk" SET "subIndicatorId" = $1 WHERE "subIndicatorId" = $2', [
                subIndicators[1].id,
                subIndicators[0].id
            ]);
            await queryRunner.query('DELETE FROM "Category" WHERE "id" = $1', [subIndicators[1].id]);
        }
    }

    private async addIndicatorTranslations(queryRunner: QueryRunner) {
        const indicators = await this.getExistingCategories(queryRunner, CategoryTypeEnum.INDICATOR);
        const mapIndicator = keyBy(indicators, 'name');
        for (const { en, ur } of indicatorTranslations) {
            if (!mapIndicator[en]) {
                throw new Error(`Indicator ${en} not found`);
            }

            await this.updateTranslation(queryRunner, mapIndicator[en].id, ur);
        }
    }

    private async addSubIndicatorTranslations(queryRunner: QueryRunner) {
        const subIndicators = await this.getExistingCategories(queryRunner, CategoryTypeEnum.SUB_INDICATOR);
        const mapSubIndicator = keyBy(subIndicators, 'name');
        for (const { en, ur } of subIndicatorTranslations) {
            if (!mapSubIndicator[en]) {
                throw new Error(`Sub-indicator ${en} not found`);
            }

            await this.updateTranslation(queryRunner, mapSubIndicator[en].id, ur);
        }
    }

    private async updateTranslation(queryRunner: QueryRunner, id: string, text: string) {
        const sql = format(
            'UPDATE "Category" SET "translation" = jsonb_set("translation", \'{ur}\', %L) WHERE "id" = %L',
            JSON.stringify(text),
            id
        );
        await queryRunner.query(sql);
    }

    private async getExistingCategories(queryRunner: QueryRunner, type: CategoryTypeEnum) {
        return queryRunner.query(`SELECT "id", "name" FROM "Category" WHERE "type" = $1`, [type]);
    }
}
