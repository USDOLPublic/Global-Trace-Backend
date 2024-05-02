import { QueryRunner } from 'typeorm';
import { BaseMigration } from '@diginexhk/typeorm-helper';
import format from 'pg-format';
import { TrashContentEnum } from '~events/enums/trash-content.enum';
import { FarmCertificationEnum } from '~facilities/enums/farm-certification.enum';
import { SeedCottonGradeEnum } from '~events/enums/seed-cotton-grade.enum';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';
import { CurrencyEnum } from '~events/enums/currency.enum';
import { LintGradeEnum } from '~events/enums/lint-grade.enum';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';

export class AddDefaultAttributes1693195942989 extends BaseMigration {
    async run(queryRunner: QueryRunner) {
        const [
            trashContent,
            moistureLevel,
            cottonCertification,
            seedCottonGrade,
            lintCottonGrade,
            totalWeight,
            price,
            productId,
            attachments,
            origin,
            description
        ] = await this.addDefaultAttributes(queryRunner);

        await this.createProductDefinition(queryRunner, 'Raw Cotton', [
            { attributeId: trashContent, isOptional: false, isAddManuallyOnly: false },
            { attributeId: moistureLevel, isOptional: false, isAddManuallyOnly: false },
            { attributeId: cottonCertification, isOptional: true, isAddManuallyOnly: false },
            { attributeId: lintCottonGrade, isOptional: true, isAddManuallyOnly: false },
            { attributeId: totalWeight, isOptional: false, isAddManuallyOnly: false }
        ]);

        await this.createProductDefinition(queryRunner, 'Lot', [
            { attributeId: productId, isOptional: false, isAddManuallyOnly: false },
            { attributeId: trashContent, isOptional: false, isAddManuallyOnly: false },
            { attributeId: moistureLevel, isOptional: false, isAddManuallyOnly: false },
            { attributeId: cottonCertification, isOptional: true, isAddManuallyOnly: false },
            { attributeId: seedCottonGrade, isOptional: true, isAddManuallyOnly: false },
            { attributeId: totalWeight, isOptional: false, isAddManuallyOnly: false },
            { attributeId: price, isOptional: false, isAddManuallyOnly: true },
            { attributeId: origin, isOptional: false, isAddManuallyOnly: true },
            { attributeId: attachments, isOptional: false, isAddManuallyOnly: false }
        ]);

        await this.createProductDefinition(queryRunner, 'Yarn', [
            { attributeId: productId, isOptional: false, isAddManuallyOnly: false },
            { attributeId: totalWeight, isOptional: false, isAddManuallyOnly: false },
            { attributeId: description, isOptional: false, isAddManuallyOnly: false },
            { attributeId: attachments, isOptional: false, isAddManuallyOnly: false }
        ]);

        await this.createProductDefinition(queryRunner, 'Fabric', [
            { attributeId: productId, isOptional: false, isAddManuallyOnly: false },
            { attributeId: totalWeight, isOptional: false, isAddManuallyOnly: false },
            { attributeId: description, isOptional: false, isAddManuallyOnly: false },
            { attributeId: attachments, isOptional: false, isAddManuallyOnly: false }
        ]);
    }

    private addDefaultAttributes(queryRunner: QueryRunner) {
        return Promise.all([
            this.addAttributeTrashContent(queryRunner),
            this.addAttributeMoistureLevel(queryRunner),
            this.addAttributeCottonCertification(queryRunner),
            this.addAttributeSeedCottonGrade(queryRunner),
            this.addAttributeLintCottonGrade(queryRunner),
            this.addAttributeTotalWeight(queryRunner),
            this.addAttributePrice(queryRunner),
            this.addAttributeProductId(queryRunner),
            this.addAttributeAttachments(queryRunner),
            this.addAttributeOrigin(queryRunner),
            this.addAttributeDescription(queryRunner)
        ]);
    }

    private async createProductDefinition(
        queryRunner: QueryRunner,
        name: string,
        attributes: { attributeId: string; isOptional: boolean; isAddManuallyOnly: boolean }[]
    ) {
        const data = [name, { en: name }];
        const productDefinitionId = await this.insertProductDefinition(queryRunner, data);

        const productDefinitionAttributes = attributes.map(({ attributeId, isOptional, isAddManuallyOnly }) => [
            productDefinitionId,
            attributeId,
            isOptional,
            isAddManuallyOnly
        ]);
        await this.insertProductDefinitionAttributes(queryRunner, productDefinitionAttributes);
    }

    private addAttributeTrashContent(queryRunner: QueryRunner): Promise<string> {
        const options = Object.values(TrashContentEnum).map((value) => ({
            value,
            translation: {
                en: value
            }
        }));
        const data = [
            'Trash Content',
            FieldTypeEnum.OTHER,
            FieldCategoryEnum.LIST,
            JSON.stringify(options),
            { en: 'Trash Content' }
        ];
        return this.insertAttribute(queryRunner, data);
    }

    private addAttributeMoistureLevel(queryRunner: QueryRunner): Promise<string> {
        const data = [
            'Moisture Level',
            FieldTypeEnum.OTHER,
            FieldCategoryEnum.PERCENTAGE,
            JSON.stringify([]),
            { en: 'Moisture Level' }
        ];
        return this.insertAttribute(queryRunner, data);
    }

    private addAttributeCottonCertification(queryRunner: QueryRunner): Promise<string> {
        const options = Object.values(FarmCertificationEnum).map((value) => ({
            value,
            translation: {
                en: value
            }
        }));
        const data = [
            'Cotton Certification',
            FieldTypeEnum.OTHER,
            FieldCategoryEnum.LIST,
            JSON.stringify(options),
            { en: 'Cotton Certification' }
        ];
        return this.insertAttribute(queryRunner, data);
    }

    private addAttributeSeedCottonGrade(queryRunner: QueryRunner): Promise<string> {
        const options = Object.values(SeedCottonGradeEnum).map((value) => ({
            value,
            translation: {
                en: value
            }
        }));
        const data = ['Grade', FieldTypeEnum.OTHER, FieldCategoryEnum.LIST, JSON.stringify(options), { en: 'Grade' }];
        return this.insertAttribute(queryRunner, data);
    }

    private addAttributeLintCottonGrade(queryRunner: QueryRunner): Promise<string> {
        const options = Object.values(LintGradeEnum).map((value) => ({
            value,
            translation: {
                en: value
            }
        }));
        const data = [
            'Lint Grade',
            FieldTypeEnum.OTHER,
            FieldCategoryEnum.LIST,
            JSON.stringify(options),
            { en: 'Lint Grade' }
        ];
        return this.insertAttribute(queryRunner, data);
    }

    private addAttributeTotalWeight(queryRunner: QueryRunner): Promise<string> {
        const options = Object.values(WeightUnitEnum).map((value) => ({
            value,
            translation: {
                en: value
            }
        }));
        const data = [
            'Total Weight',
            FieldTypeEnum.PRODUCT_QUANTITY,
            FieldCategoryEnum.NUMBER_UNIT_PAIR,
            JSON.stringify(options),
            { en: 'Total Weight' }
        ];
        return this.insertAttribute(queryRunner, data);
    }

    private addAttributePrice(queryRunner: QueryRunner): Promise<string> {
        const options = Object.values(CurrencyEnum).map((value) => ({
            value,
            translation: {
                en: value
            }
        }));
        const data = [
            'Price',
            FieldTypeEnum.OTHER,
            FieldCategoryEnum.NUMBER_UNIT_PAIR,
            JSON.stringify(options),
            { en: 'Price' }
        ];
        return this.insertAttribute(queryRunner, data);
    }

    private addAttributeProductId(queryRunner: QueryRunner): Promise<string> {
        const data = [
            'Product ID',
            FieldTypeEnum.PRODUCT_ID,
            FieldCategoryEnum.TEXT,
            JSON.stringify([]),
            { en: 'Product ID' }
        ];
        return this.insertAttribute(queryRunner, data);
    }

    private addAttributeAttachments(queryRunner: QueryRunner): Promise<string> {
        const data = [
            'Attachments',
            FieldTypeEnum.OTHER,
            FieldCategoryEnum.ATTACHMENTS,
            JSON.stringify([]),
            { en: 'Attachments' }
        ];
        return this.insertAttribute(queryRunner, data);
    }

    private addAttributeOrigin(queryRunner: QueryRunner): Promise<string> {
        const data = [
            'Product Origin',
            FieldTypeEnum.OTHER,
            FieldCategoryEnum.COUNTRY_PROVINCE_DISTRICT,
            JSON.stringify([]),
            { en: 'Product Origin' }
        ];
        return this.insertAttribute(queryRunner, data);
    }

    private addAttributeDescription(queryRunner: QueryRunner): Promise<string> {
        const data = [
            'Description',
            FieldTypeEnum.OTHER,
            FieldCategoryEnum.TEXT,
            JSON.stringify([]),
            { en: 'Description' }
        ];
        return this.insertAttribute(queryRunner, data);
    }

    private async insertAttribute(queryRunner: QueryRunner, insertData: any[]): Promise<string> {
        const sql = format(
            'INSERT INTO "Attribute" ("name", "type", "category", "options", "nameTranslation") VALUES (%L) RETURNING "id"',
            insertData
        );
        const [{ id }] = await queryRunner.query(sql);
        return id;
    }

    private async insertProductDefinition(queryRunner: QueryRunner, insertData: any[]): Promise<string> {
        const sql = format(
            'INSERT INTO "ProductDefinition" ("name", "nameTranslation") VALUES (%L) RETURNING "id"',
            insertData
        );
        const [{ id }] = await queryRunner.query(sql);
        return id;
    }

    private insertProductDefinitionAttributes(queryRunner: QueryRunner, insertData: any[]): Promise<string> {
        const sql = format(
            'INSERT INTO "ProductDefinitionAttribute" ("productDefinitionId", "attributeId", "isOptional", "isAddManuallyOnly") VALUES %L',
            insertData
        );
        return queryRunner.query(sql);
    }

    async rollback(queryRunner: QueryRunner) {
        await queryRunner.query('DELETE FROM "Attribute"');
        await queryRunner.query('DELETE FROM "ProductDefinition"');
    }
}
