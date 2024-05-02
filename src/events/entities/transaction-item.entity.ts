import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { ProductEntity } from '~products/entities/product.entity';
import { TransactionEntity } from './transaction.entity';

@Entity('TransactionItem')
export class TransactionItemEntity extends BaseEntity {
    @Index()
    @Column()
    transactionId: string;

    @Column()
    entityId: string;

    @ManyToOne(() => TransactionEntity, (transaction) => transaction.transactionItems)
    @JoinColumn({ name: 'transactionId' })
    transaction: TransactionEntity;

    @ManyToOne(() => ProductEntity, (product) => product.transactionItems)
    @JoinColumn({ name: 'entityId' })
    product: ProductEntity;
}
