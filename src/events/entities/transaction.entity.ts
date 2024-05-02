import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, Unique } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { FloatTransformer } from '~core/transformers/float.transformer';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { CurrencyEnum } from '~events/enums/currency.enum';
import { TransactionTypeEnum } from '~events/enums/transaction-type.enum';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { EventEntity } from '~history/entities/event.entity';
import { UserEntity } from '~users/entities/user.entity';
import { TransactionItemEntity } from './transaction-item.entity';
import { FileUploadUrlTransformer } from '~core/transformers/file-upload-url.transformer';
import { FileUploadType } from '~core/types/file-upload.type';

@Entity('Transaction')
@Unique(['toFacilityId', 'purchaseOrderNumber'])
@Unique(['fromFacilityId', 'invoiceNumber'])
@Unique(['fromFacilityId', 'packingListNumber'])
export class TransactionEntity extends BaseEntity {
    @Index()
    @Column({ nullable: true })
    fromFacilityId: string;

    @Index()
    @Column()
    toFacilityId: string;

    @Index()
    @Column()
    facilityId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, transformer: new FloatTransformer() })
    price: number;

    @Column({ nullable: true })
    currency: CurrencyEnum;

    @Column({ type: 'decimal', precision: 14, scale: 2, default: 0, transformer: new FloatTransformer() })
    totalWeight: number = 0;

    @Column({ nullable: true })
    weightUnit: WeightUnitEnum;

    @Column({ nullable: true })
    purchaseOrderNumber: string;

    @Column({ nullable: true })
    invoiceNumber: string;

    @Column({ nullable: true })
    packingListNumber: string;

    @Column({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    transactedAt: Date | number;

    @Column({ type: 'jsonb', transformer: new FileUploadUrlTransformer() })
    uploadProofs: FileUploadType[];

    @Column({ type: 'jsonb', transformer: new FileUploadUrlTransformer() })
    uploadInvoices: FileUploadType[];

    @Column({ type: 'jsonb', transformer: new FileUploadUrlTransformer() })
    uploadPackingLists: FileUploadType[];

    @Column()
    type: TransactionTypeEnum;

    @Column()
    creatorId: string;

    @DeleteDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    deletedAt: Date;

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'fromFacilityId' })
    fromFacility: FacilityEntity;

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'toFacilityId' })
    toFacility: FacilityEntity;

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'facilityId' })
    facility: FacilityEntity;

    @OneToMany(() => TransactionItemEntity, (transactionItem) => transactionItem.transaction)
    transactionItems: TransactionItemEntity[];

    @ManyToOne(() => UserEntity)
    @JoinColumn([{ name: 'creatorId' }])
    creator: UserEntity;

    @OneToOne(() => EventEntity, (event) => event.transaction)
    event: EventEntity;
}
