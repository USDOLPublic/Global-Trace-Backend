import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';

import { TransactionItemEntity } from '~events/entities/transaction-item.entity';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransactionItemRepository } from '~events/repositories/transaction-item.repository';
import { ProductEntity } from '~products/entities/product.entity';

@Injectable()
export class TransactionItemService {
    constructor(private transactionItemRepo: TransactionItemRepository) {}

    createOne(transaction: TransactionEntity, entity: ProductEntity) {
        return this.transactionItemRepo.createOne({
            entityId: entity.id,
            transaction
        });
    }

    createMany(transaction: TransactionEntity, entities: ProductEntity[]) {
        const transactionItems = entities.map((entity) =>
            this.transactionItemRepo.create({
                entityId: entity.id,
                transaction
            })
        );
        return this.transactionItemRepo.save(transactionItems);
    }

    find(options: FindManyOptions<TransactionItemEntity>): Promise<TransactionItemEntity[]> {
        return this.transactionItemRepo.find(options);
    }
}
