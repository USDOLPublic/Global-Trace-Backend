import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { ProductDefinitionAttributeEntity } from '~product-definitions/entities/product-definition-attribute.entity';

@CustomRepository(ProductDefinitionAttributeEntity)
export class ProductDefinitionAttributeRepository extends BaseRepository<ProductDefinitionAttributeEntity> {}
