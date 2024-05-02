import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { I18nField } from '~self-assessments/types/i18n-field.type';
import { AttributeEntity } from './attribute.entity';
import { ProductDefinitionAttributeEntity } from './product-definition-attribute.entity';

@Entity('ProductDefinition')
export class ProductDefinitionEntity extends BaseEntity {
    @Column()
    name: string;

    @Column({ type: 'jsonb' })
    nameTranslation: I18nField;

    @ManyToMany(() => AttributeEntity, (attribute) => attribute.productDefinitions)
    @JoinTable({ name: 'ProductDefinitionAttribute' })
    attributes: AttributeEntity[];

    @OneToMany(
        () => ProductDefinitionAttributeEntity,
        (productDefinitionAttribute) => productDefinitionAttribute.productDefinition
    )
    productDefinitionAttributes: ProductDefinitionAttributeEntity[];
}
