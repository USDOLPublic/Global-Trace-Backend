import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ProductEntity } from '~products/entities/product.entity';

@Entity('FacilityItem')
export class FacilityItemEntity extends BaseEntity {
    @Index()
    @Column()
    facilityId: string;

    @Column()
    entityId: string;

    @ManyToOne(() => FacilityEntity)
    @JoinColumn({ name: 'facilityId' })
    facility: FacilityEntity;

    @ManyToOne(() => ProductEntity, (product) => product.facilityItems)
    @JoinColumn({ name: 'entityId' })
    product: ProductEntity;
}
