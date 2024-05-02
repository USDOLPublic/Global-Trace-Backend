import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { WeightUnitEnum } from '~events/enums/weight-unit.enum';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { FloatTransformer } from '~core/transformers/float.transformer';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { EventEntity } from '~history/entities/event.entity';
import { FileUploadType } from '~core/types/file-upload.type';
import { FileUploadUrlTransformer } from '~core/transformers/file-upload-url.transformer';

@Entity('RecordProduct')
export class RecordProductEntity extends BaseEntity {
    @Column({ type: 'decimal', precision: 10, scale: 2, transformer: new FloatTransformer() })
    totalWeight: number;

    @Column()
    weightUnit: WeightUnitEnum;

    @Column()
    facilityId: string;

    @Column({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    recordedAt: Date | number;

    @Column({ type: 'jsonb', transformer: new FileUploadUrlTransformer() })
    uploadProofs: FileUploadType[];

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'facilityId' })
    facility: FacilityEntity;

    @OneToOne(() => EventEntity, (event) => event.recordProduct)
    event: EventEntity;
}
