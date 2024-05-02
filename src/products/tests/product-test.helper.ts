import { BaseEntity } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TestHelper } from '~core/tests/test.helper';
import { ProductDefinitionRepository } from '~product-definitions/repositories/product-definition.repository';
import { ProductEntity } from '~products/entities/product.entity';
import { ProductRepository } from '~products/repositories/product.repository';
import faker from 'faker';
import { v4 as uuidv4 } from 'uuid';
import { AttributeEntity } from '~product-definitions/entities/attribute.entity';
import { AttributeRepository } from '~product-definitions/repositories/attribute.repository';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { ProductDefinitionAttributeRepository } from '~product-definitions/repositories/product-definition-attribute.repository';

export class ProductTestHelper {
    constructor(private testHelper: TestHelper) {}

    async createProduct(options: QueryDeepPartialEntity<ProductEntity> = {}) {
        let productDefinitionId = options?.productDefinitionId;

        if (!productDefinitionId) {
            productDefinitionId = (
                await ProductDefinitionRepository.make().createOne({
                    name: faker.name.title(),
                    nameTranslation: { en: faker.name.title() }
                })
            ).id;
        }

        return ProductRepository.make().createOne({
            productDefinitionId,
            createdFacilityId: uuidv4(),
            ...options
        });
    }

    async createProductDefinition(
        options: QueryDeepPartialEntity<ProductDefinitionEntity> = {},
        attributes?: { id: string; isAddManuallyOnly?: boolean; isOptional?: boolean; order?: number }[]
    ) {
        const productDefinition = await ProductDefinitionRepository.make().createOne({
            ...options
        });

        if (attributes?.length) {
            await ProductDefinitionAttributeRepository.make().save(
                attributes.map(({ id, isAddManuallyOnly, isOptional, order }) => ({
                    productDefinitionId: productDefinition.id,
                    attributeId: id,
                    isAddManuallyOnly,
                    isOptional,
                    order
                }))
            );
        }
        return productDefinition;
    }

    async createAttribute(options: QueryDeepPartialEntity<AttributeEntity> = {}) {
        return AttributeRepository.make().createOne({
            ...options
        });
    }

    async visibleInDatabase(entity: typeof BaseEntity, condition) {
        if (typeof condition === 'string') {
            condition = { id: condition };
        }
        if (!(await entity.getRepository().findOneBy(condition))) {
            throw new Error(`${JSON.stringify(condition)} invisible in database`);
        }
    }
}
