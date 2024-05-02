import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { ProductDefinitionFileEntity } from '~product-definitions/entities/product-definition-file.entity';

@CustomRepository(ProductDefinitionFileEntity)
export class ProductDefinitionFileRepository extends BaseRepository<ProductDefinitionFileEntity> {}
