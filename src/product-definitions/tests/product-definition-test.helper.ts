import faker from 'faker';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TestHelper } from '~core/tests/test.helper';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';
import { ProductDefinitionRepository } from '~product-definitions/repositories/product-definition.repository';

export class ProductDefinitionTestHelper {
    constructor(private testHelper: TestHelper) {}

    createProductDefinition(options: QueryDeepPartialEntity<ProductDefinitionEntity> = {}) {
        const name = faker.lorem.word();
        return ProductDefinitionRepository.make().createOne({
            name,
            nameTranslation: { en: name },
            ...options
        });
    }
}
