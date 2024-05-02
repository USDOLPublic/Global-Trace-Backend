import { CustomRepository } from '@diginexhk/typeorm-helper';
import { Between, In } from 'typeorm';
import { BaseRepository } from '~core/repositories/base.repository';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { GetTransactionParamType } from '~events/types/get-transaction-param.type';
import { TimeRangeType } from '~events/types/time-range.type';

@CustomRepository(TransactionEntity)
export class TransactionRepository extends BaseRepository<TransactionEntity> {
    get alias(): string {
        return 'Transaction';
    }

    findTransactionsByProducts(type: TransactionTypeEnum, entityIds: string[]) {
        return this.createQueryBuilder(this.alias)
            .innerJoin(`${this.alias}.transactionItems`, 'transactionItems')
            .where({ type })
            .andWhere('transactionItems.entityId IN (:...entityIds)', { entityIds })
            .getMany();
    }

    getTotalPurchasedByTime(facilityId: string, timeRange: TimeRangeType<Date>) {
        return this.getTransactionsByTime(facilityId, TransactionTypeEnum.PURCHASE, timeRange);
    }

    getTotalSoldByTime(facilityId: string, timeRange: TimeRangeType<Date>) {
        return this.getTransactionsByTime(facilityId, TransactionTypeEnum.SELL, timeRange);
    }

    private getTransactionsByTime(facilityId: string, type: TransactionTypeEnum, timeRange: TimeRangeType<Date>) {
        const query = this.createQueryBuilder(this.alias)
            .innerJoinAndSelect(`${this.alias}.facility`, 'facility')
            .innerJoinAndSelect(`${this.alias}.transactionItems`, 'transactionItems')
            .innerJoinAndSelect(`transactionItems.product`, 'product')
            .where({ facilityId, type });

        if (timeRange.from) {
            query.andWhere(`${this.alias}.transactedAt >= :from`, { from: timeRange.from });
        }

        if (timeRange.to) {
            query.andWhere(`${this.alias}.transactedAt <= :to`, { to: timeRange.to });
        }

        return query.getMany();
    }

    findTransactionWithinTimeRange(facility: FacilityEntity, from: Date, to: Date) {
        return this.createQueryBuilder(this.alias)
            .withDeleted()
            .innerJoinAndSelect(`${this.alias}.transactionItems`, 'transactionItems')
            .leftJoinAndSelect(`${this.alias}.fromFacility`, 'fromFacility')
            .leftJoinAndSelect('fromFacility.type', 'fromFacilityType')
            .where({
                toFacilityId: facility.id,
                type: In([TransactionTypeEnum.PURCHASE, TransactionTypeEnum.SELL]),
                transactedAt: Between(from, to)
            })
            .getMany();
    }

    findTransactionsPurchaseProducts(facility: FacilityEntity, entityIds: string[]) {
        return this.createQueryBuilder(this.alias)
            .innerJoinAndSelect(`${this.alias}.transactionItems`, 'transactionItems')
            .where({
                facilityId: facility.id,
                type: TransactionTypeEnum.PURCHASE
            })
            .andWhere('transactionItems.entityId IN (:...entityIds)', { entityIds })
            .getMany();
    }

    findTransactionsTransactProducts(
        facility: FacilityEntity,
        entityIds: string[],
        transactionTypes: TransactionTypeEnum[]
    ) {
        return this.createQueryBuilder(this.alias)
            .withDeleted()
            .innerJoinAndSelect(`${this.alias}.transactionItems`, 'transactionItems')
            .innerJoinAndSelect(`${this.alias}.fromFacility`, 'fromFacility')
            .innerJoinAndSelect('fromFacility.type', 'fromFacilityType')
            .where({
                toFacilityId: facility.id,
                type: In(transactionTypes)
            })
            .andWhere('transactionItems.entityId IN (:...entityIds)', { entityIds })
            .getMany();
    }

    findTransactionsSaleProducts(facility: FacilityEntity, entityIds: string[]) {
        return this.createQueryBuilder(this.alias)
            .withDeleted()
            .innerJoin(`${this.alias}.transactionItems`, 'transactionItems')
            .innerJoinAndSelect(`${this.alias}.fromFacility`, 'fromFacility')
            .leftJoinAndSelect('fromFacility.type', 'fromFacilityType')
            .where({
                facilityId: facility.id,
                type: TransactionTypeEnum.SELL
            })
            .andWhere('transactionItems.entityId IN (:...entityIds)', { entityIds })
            .getMany();
    }

    getTransactionById(params: GetTransactionParamType) {
        const query = this.createQueryBuilder(this.alias)
            .where({ id: params.id })
            .leftJoinAndSelect(`${this.alias}.transactionItems`, 'transactionItems')
            .leftJoinAndSelect(`${this.alias}.fromFacility`, 'fromFacility')
            .leftJoinAndSelect(`${this.alias}.toFacility`, 'toFacility')
            .leftJoinAndSelect('transactionItems.product', 'product');

        if (params.fromFacilityId) {
            query.andWhere({ fromFacilityId: params.fromFacilityId });
        }

        if (params.toFacilityId) {
            query.andWhere({ toFacilityId: params.toFacilityId });
        }

        return query.getOne();
    }

    getLatestPurchase(facility: FacilityEntity) {
        return this.createQueryBuilder('Transaction')
            .where({ facilityId: facility.id, type: TransactionTypeEnum.PURCHASE })
            .orderBy('Transaction.createdAt', 'DESC')
            .getOne();
    }

    getRecentPurchases(facility: FacilityEntity, from: Date, to: Date) {
        return this.createQueryBuilder(this.alias)
            .innerJoinAndSelect('Transaction.transactionItems', 'TransactionItem')
            .innerJoinAndSelect('TransactionItem.product', 'Product')
            .where({
                facilityId: facility.id,
                type: TransactionTypeEnum.PURCHASE,
                transactedAt: Between(from, to)
            })
            .getMany();
    }

    getRawTransactionsByIds(ids: string[]) {
        return this.createQueryBuilder(this.alias)
            .innerJoinAndMapMany(`${this.alias}.transactionItems`, `${this.alias}.transactionItems`, 'transactionItems')
            .leftJoinAndMapOne('transactionItems.product', 'transactionItems.product', 'product')
            .where({ id: In(ids) })
            .select([
                '"Transaction"."id"',
                '"Transaction"."fromFacilityId"',
                '"product"."id" as "productId"',
                '"product"."certifications"',
                '"Transaction"."uploadProofs"',
                '"Transaction"."uploadInvoices"',
                '"Transaction"."uploadPackingLists"'
            ])
            .getRawMany();
    }

    getDocumentTransactionsById(id: string) {
        return this.createQueryBuilder(this.alias)
            .where({ id })
            .select(['"id"', '"facilityId"', '"uploadProofs"', '"uploadInvoices"', '"uploadPackingLists"'])
            .getRawOne();
    }
}
