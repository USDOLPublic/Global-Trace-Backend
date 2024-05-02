import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { ProductEntity } from '~products/entities/product.entity';
import { QrCodeStatusEnum } from '~qr-codes/enums/qr-code-status.enum';
import { QrCodeBatchEntity } from './qr-code-batch.entity';

@Entity('QrCode')
export class QrCodeEntity extends BaseEntity {
    @Column()
    qrCodeBatchId: string;

    @Index()
    @Column({ nullable: true })
    productId: string;

    @Column()
    code: string;

    @Column({ default: QrCodeStatusEnum.ENCODED })
    status: QrCodeStatusEnum;

    @DeleteDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    deletedAt: Date;

    @ManyToOne(() => QrCodeBatchEntity, (qrCodeBatch) => qrCodeBatch.qrCodes)
    @JoinColumn({ name: 'qrCodeBatchId' })
    qrCodeBatch: QrCodeBatchEntity;

    @OneToOne(() => ProductEntity, (product) => product.qrCode, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;
}
