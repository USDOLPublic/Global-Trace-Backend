import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { UserEntity } from '~users/entities/user.entity';
import { QrCodeEntity } from './qr-code.entity';

@Entity('QrCodeBatch')
export class QrCodeBatchEntity extends BaseEntity {
    @Column()
    name: string;

    @Column()
    quantity: number;

    @Column()
    totalEncoded: number;

    @Column({ default: 0 })
    totalActive: number;

    @Column({ default: 0 })
    totalDispensed: number;

    @Column({
        type: 'timestamp',
        nullable: true,
        transformer: new TimestampTransformer()
    })
    completedAt: Date | number;

    @Column()
    creatorId: string;

    @DeleteDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    deletedAt: Date;

    @OneToMany(() => QrCodeEntity, (qrCode) => qrCode.qrCodeBatch)
    qrCodes: QrCodeEntity[];

    @ManyToOne(() => UserEntity)
    @JoinColumn([{ name: 'creatorId' }])
    creator: UserEntity;
}
