import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { FileUploadUrlTransformer } from '~core/transformers/file-upload-url.transformer';
import { StatusDnaTestingEnum } from '~dna-testing/enums/status-dna-testing.enum';
import { FileUploadType } from '~core/types/file-upload.type';

@Entity('DnaTesting')
export class DnaTestingEntity extends BaseEntity {
    @Index()
    @Column()
    requestFacilityId: string;

    @Column()
    productId: string;

    @Index()
    @Column()
    productSupplierId: string;

    @Column({ default: false })
    isDetected: boolean;

    @Column({ type: 'character varying', array: true })
    dnaIdentifiers: string[];

    @Column({ type: 'enum', enum: StatusDnaTestingEnum, nullable: true })
    status: StatusDnaTestingEnum;

    @Column({
        type: 'timestamp',
        transformer: new TimestampTransformer(),
        nullable: true
    })
    testedAt: number;

    @Column({ nullable: true })
    creatorId: string;

    @Column({ type: 'jsonb', transformer: new FileUploadUrlTransformer() })
    uploadProofs: FileUploadType[];

    @ManyToOne(() => FacilityEntity, (facility) => facility.dnaTesting)
    @JoinColumn({ name: 'requestFacilityId' })
    requestFacility: FacilityEntity;

    @ManyToOne(() => FacilityEntity, (facility) => facility.dnaTesting)
    @JoinColumn({ name: 'productSupplierId' })
    productSupplier: FacilityEntity;
}
