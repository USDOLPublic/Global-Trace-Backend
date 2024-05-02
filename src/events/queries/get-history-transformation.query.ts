import { BaseQuery } from '@diginexhk/typeorm-helper';
import { In, SelectQueryBuilder } from 'typeorm';
import { TransformationEntity } from '~events/entities/transformation.entity';

export class GetHistoryTransformationQuery extends BaseQuery<TransformationEntity> {
    constructor(private ids: string[]) {
        super();
    }

    alias(): string {
        return 'Transformation';
    }

    query(query: SelectQueryBuilder<TransformationEntity>) {
        query
            .innerJoinAndMapMany(
                'Transformation.transformationItems',
                'Transformation.transformationItems',
                'transformationItems',
                'transformationItems.isInput = false'
            )
            .leftJoinAndMapOne('transformationItems.product', 'transformationItems.product', 'product')
            .leftJoinAndSelect('product.productDefinition', 'productDefinition')
            .leftJoinAndSelect('productDefinition.productDefinitionAttributes', 'productDefinitionAttribute')
            .leftJoinAndSelect('productDefinitionAttribute.attribute', 'attribute')
            .withDeleted()
            .leftJoinAndSelect('product.qrCode', 'qrCode')
            .where({ id: In(this.ids) });
    }
}
