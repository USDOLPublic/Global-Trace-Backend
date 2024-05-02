import { SortParams } from '@diginexhk/nestjs-base-decorator';
import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { ProductDefinitionEntity } from '~product-definitions/entities/product-definition.entity';

@CustomRepository(ProductDefinitionEntity)
export class ProductDefinitionRepository extends BaseRepository<ProductDefinitionEntity> {
    findProductDefinitions({ sortField, sortDirection }: SortParams): Promise<ProductDefinitionEntity[]> {
        return this.createQueryBuilder('ProductDefinition')
            .leftJoinAndSelect(`ProductDefinition.productDefinitionAttributes`, 'productDefinitionAttributes')
            .leftJoinAndSelect(`productDefinitionAttributes.attribute`, 'attribute')
            .orderBy(`ProductDefinition.${sortField}`, `${sortDirection}`)
            .orderBy('productDefinitionAttributes.order', 'ASC')
            .getMany();
    }
}
