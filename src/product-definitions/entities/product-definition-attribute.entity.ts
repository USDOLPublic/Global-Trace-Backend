import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { ProductDefinitionEntity } from './product-definition.entity';
import { AttributeEntity } from './attribute.entity';

@Entity('ProductDefinitionAttribute')
export class ProductDefinitionAttributeEntity extends BaseEntity {
    @Index()
    @Column()
    productDefinitionId: string;

    @Index()
    @Column()
    attributeId: string;

    @Column({ default: 1 })
    order: number;

    @Column({ default: false })
    isAddManuallyOnly: boolean;

    @Column({ default: false })
    isOptional: boolean;

    @ManyToOne(() => ProductDefinitionEntity)
    @JoinColumn({ name: 'productDefinitionId' })
    productDefinition: ProductDefinitionEntity;

    @ManyToOne(() => AttributeEntity)
    @JoinColumn({ name: 'attributeId' })
    attribute: AttributeEntity;
}
