import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { ProductEntity } from '~products/entities/product.entity';
import { TransformationEntity } from './transformation.entity';

@Entity('TransformationItem')
export class TransformationItemEntity extends BaseEntity {
    @Index()
    @Column()
    transformationId: string;

    @Column()
    entityId: string;

    @Column()
    isInput: boolean;

    @ManyToOne(() => TransformationEntity, (transformation) => transformation.transformationItems)
    @JoinColumn({ name: 'transformationId' })
    transformation: TransformationEntity;

    @ManyToOne(() => ProductEntity, (product) => product.transformationItems)
    @JoinColumn({ name: 'entityId' })
    product: ProductEntity;
}
