import { Column, Entity, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { MaxLength } from 'class-validator';
import { BaseEntity } from '~core/entities/base.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { OrderSupplierEntity } from './order-supplier.entity';

@Entity('Order')
export class OrderEntity extends BaseEntity {
    @Column()
    purchaseOrderNumber: string;

    @Column({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    purchasedAt: Date;

    @Column()
    @MaxLength(255)
    productDescription: string;

    @Column()
    quantity: string;

    @Column({ nullable: true })
    invoiceNumber: string;

    @Column({ nullable: true })
    packingListNumber: string;

    @Column()
    creatorId: string;

    @Index()
    @Column()
    facilityId: string;

    @Index()
    @Column()
    supplierId: string;

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'facilityId' })
    facility: FacilityEntity;

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'supplierId' })
    supplier: FacilityEntity;

    @OneToMany(() => OrderSupplierEntity, (orderSupplier) => orderSupplier.order)
    orderSuppliers: OrderSupplierEntity[];
}
