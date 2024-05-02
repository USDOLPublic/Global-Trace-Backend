import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { RecordProductEntity } from '~events/entities/record-product.entity';
import { TransactionEntity } from '~events/entities/transaction.entity';
import { TransformationEntity } from '~events/entities/transformation.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { EventTypeEnum } from '~history/enums/event-type.enum';

@Entity('Event')
export class EventEntity extends BaseEntity {
    @Index()
    @Column()
    facilityId: string;

    @Column()
    type: EventTypeEnum;

    @Column({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    recordedAt: Date | number;

    @Column()
    entityId: string;

    @Column()
    entityType: string;

    @DeleteDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    deletedAt: Date;

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'facilityId' })
    facility: FacilityEntity;

    @OneToOne(() => TransactionEntity, (transaction) => transaction.event)
    @JoinColumn({ name: 'entityId' })
    transaction: TransactionEntity;

    @OneToOne(() => TransformationEntity, (transformation) => transformation.event)
    @JoinColumn({ name: 'entityId' })
    transformation: TransformationEntity;

    @OneToOne(() => RecordProductEntity, (recordProduct) => recordProduct.event)
    @JoinColumn({ name: 'entityId' })
    recordProduct: RecordProductEntity;
}
