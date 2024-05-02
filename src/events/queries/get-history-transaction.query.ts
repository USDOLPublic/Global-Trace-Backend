import { BaseQuery } from '@diginexhk/typeorm-helper';
import { In, SelectQueryBuilder } from 'typeorm';
import { TransactionEntity } from '~events/entities/transaction.entity';

export class GetHistoryTransactionQuery extends BaseQuery<TransactionEntity> {
    constructor(private ids: string[]) {
        super();
    }

    alias(): string {
        return 'Transaction';
    }

    query(query: SelectQueryBuilder<TransactionEntity>): void {
        query
            .leftJoinAndSelect(`${this.alias()}.toFacility`, 'toFacility')
            .leftJoinAndSelect(`toFacility.type`, 'toFacilityType')
            .leftJoinAndSelect(`${this.alias()}.fromFacility`, 'fromFacility')
            .leftJoinAndSelect(`fromFacility.type`, 'fromFacilityType')
            .innerJoinAndMapMany('Transaction.transactionItems', 'Transaction.transactionItems', 'transactionItems')
            .leftJoinAndMapOne('transactionItems.product', 'transactionItems.product', 'product')
            .leftJoinAndSelect('product.productDefinition', 'productDefinition')
            .leftJoinAndSelect('productDefinition.productDefinitionAttributes', 'productDefinitionAttribute')
            .leftJoinAndSelect('productDefinitionAttribute.attribute', 'attribute')
            .withDeleted()
            .leftJoinAndSelect('product.qrCode', 'qrCode')
            .where({ id: In(this.ids) });
    }
}
