import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, Unique } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { ProofUrlTransformer } from '~events/transformers/proof-url.transformer';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { EventEntity } from '~history/entities/event.entity';
import { UserEntity } from '~users/entities/user.entity';
import { TransformationItemEntity } from './transformation-item.entity';

@Entity('Transformation')
@Unique(['facilityId'])
export class TransformationEntity extends BaseEntity {
    @Index()
    @Column()
    facilityId: string;

    @Column({ type: 'jsonb', transformer: new ProofUrlTransformer() })
    uploadCertifications: string[];

    @Column()
    creatorId: string;

    @DeleteDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    deletedAt: Date;

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'facilityId' })
    facility: FacilityEntity;

    @OneToMany(() => TransformationItemEntity, (transformationItem) => transformationItem.transformation)
    transformationItems: TransformationItemEntity[];

    @ManyToOne(() => UserEntity)
    @JoinColumn([{ name: 'creatorId' }])
    creator: UserEntity;

    @OneToOne(() => EventEntity, (event) => event.transformation)
    event: EventEntity;
}
