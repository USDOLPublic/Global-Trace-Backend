import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { OrderEntity } from './order.entity';

@Entity('OrderSupplier')
export class OrderSupplierEntity extends BaseEntity {
    @Index()
    @Column()
    orderId: string;

    @Index()
    @Column()
    supplierId: string;

    @Index()
    @Column({ nullable: true })
    fromSupplierId: string;

    @Index()
    @Column({ nullable: true })
    parentId: string;

    @Column({ nullable: true })
    purchaseOrderNumber: string;

    @Column({
        nullable: true,
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    purchasedAt: Date;

    @Column({ nullable: true })
    invoiceNumber: string;

    @Column({ nullable: true })
    packingListNumber: string;

    @ManyToOne(() => OrderEntity, (order) => order.orderSuppliers)
    @JoinColumn({ name: 'orderId' })
    order: OrderEntity;

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'supplierId' })
    supplier: FacilityEntity;

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'fromSupplierId' })
    fromSupplier: FacilityEntity;
}
