import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { FieldTypeEnum } from '~product-definitions/enums/field-type.enum';
import { I18nField } from '~self-assessments/types/i18n-field.type';
import { ProductDefinitionEntity } from './product-definition.entity';
import { ProductDefinitionAttributeEntity } from './product-definition-attribute.entity';
import { FieldCategoryEnum } from '~product-definitions/enums/field-category.enum';

@Entity('Attribute')
export class AttributeEntity extends BaseEntity {
    @Column()
    name: string;

    @Column()
    type: FieldTypeEnum;

    @Column()
    category: FieldCategoryEnum;

    @Column({ type: 'jsonb' })
    nameTranslation: I18nField;

    @Column({ type: 'jsonb' })
    options: { value: string; translation: I18nField }[];

    @ManyToMany(() => ProductDefinitionEntity, (productDefinition) => productDefinition.attributes)
    @JoinTable({ name: 'ProductDefinitionAttribute' })
    productDefinitions: ProductDefinitionEntity[];

    @OneToMany(
        () => ProductDefinitionAttributeEntity,
        (productDefinitionAttribute) => productDefinitionAttribute.attribute
    )
    productDefinitionAttributes: ProductDefinitionAttributeEntity[];
}
