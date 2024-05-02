import { Injectable } from '@nestjs/common';
import { TransformationEntity } from '~events/entities/transformation.entity';
import { TransformationItemRepository } from '~events/repositories/transformation-item.repository';
import { ProductEntity } from '~products/entities/product.entity';

@Injectable()
export class TransformationItemService {
    constructor(private transformationItemRepo: TransformationItemRepository) {}

    createOne(transformation: TransformationEntity, entity: ProductEntity, isInput: boolean = false) {
        return this.transformationItemRepo.createOne({
            transformation,
            entityId: entity.id,
            isInput
        });
    }

    createMany(transformation: TransformationEntity, entities: ProductEntity[], isInput: boolean = false) {
        const transactionItems = entities.map((entity) =>
            this.transformationItemRepo.create({
                transformation,
                entityId: entity.id,
                isInput
            })
        );
        return this.transformationItemRepo.save(transactionItems);
    }
}
