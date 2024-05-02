import { CustomRepository } from '@diginexhk/typeorm-helper';
import { In } from 'typeorm';
import { BaseRepository } from '~core/repositories/base.repository';
import { TimeRangeType } from '~events/types/time-range.type';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { ProductEntity } from '~products/entities/product.entity';

@CustomRepository(ProductEntity)
export class ProductRepository extends BaseRepository<ProductEntity> {
    get alias(): string {
        return 'Product';
    }

    private createFacilityProductQueryBuilder(facility: FacilityEntity) {
        return this.createQueryBuilder(this.alias)
            .innerJoin('FacilityItem', 'FacilityItem', `${this.alias}.id = FacilityItem.entityId`)
            .where('FacilityItem.facilityId = :facilityId', { facilityId: facility.id });
    }

    findFacilityProductsById(facility: FacilityEntity, ids: string[]) {
        return this.createFacilityProductQueryBuilder(facility)
            .andWhere({ id: In(ids) })
            .getManyAndCount();
    }

    findFacilityProductByCode(facility: FacilityEntity, code: string) {
        return this.createFacilityProductQueryBuilder(facility).andWhere({ code }).getOne();
    }

    getPurchaseCottonNotTransformed(
        facility: FacilityEntity,
        productDefinitionId: string,
        timeRange: TimeRangeType<Date>
    ) {
        const query = this.createQueryBuilder('Product')
            .innerJoin('Product.transactionItems', 'transactionItems')
            .innerJoin('transactionItems.transaction', 'Transaction')
            .where('Transaction.facilityId = :facilityId', { facilityId: facility.id })
            .andWhere('Transaction.type = :transactionType', { transactionType: TransactionTypeEnum.PURCHASE })
            .andWhere('Product.productDefinitionId = :productDefinitionId', { productDefinitionId })
            .andWhere('Product.isTransformed = :isTransformed', { isTransformed: false });

        if (timeRange.from) {
            query.andWhere('Transaction.transactedAt >= :from', { from: timeRange.from });
        }

        if (timeRange.to) {
            query.andWhere('Transaction.transactedAt <= :to', { to: timeRange.to });
        }

        return query.getMany();
    }

    findPurchaseTransactionsByProductIds(ids: string[]) {
        return this.createQueryBuilder(this.alias)
            .innerJoinAndSelect(`${this.alias}.transactionItems`, 'transactionItems')
            .innerJoinAndSelect('transactionItems.transaction', 'transaction')
            .innerJoinAndSelect('transaction.toFacility', 'toFacility')
            .where({ id: In(ids) })
            .andWhere('transaction.type = :transactionType', { transactionType: TransactionTypeEnum.PURCHASE })
            .withDeleted()
            .leftJoinAndSelect(`${this.alias}.qrCode`, 'qrCode')
            .getMany();
    }
}
