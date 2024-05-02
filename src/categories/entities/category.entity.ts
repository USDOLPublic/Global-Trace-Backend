import { currentLanguage } from '@diginexhk/nestjs-cls-translation';
import { AfterLoad, Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import { BaseEntity } from '~core/entities/base.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { I18nField } from '~self-assessments/types/i18n-field.type';
import { RiskSeverityEnum } from '~taxonomy-exploitations/enums/risk-severity.enum';

@Entity('Category')
export class CategoryEntity extends BaseEntity {
    @Column({ nullable: true })
    @Index()
    parentId: string | null;

    @Column()
    name: string;

    @Column()
    type: CategoryTypeEnum;

    @Column({ type: 'int', default: 1 })
    riskSeverity: RiskSeverityEnum;

    @DeleteDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer(),
        nullable: true
    })
    deletedAt: number;

    @Column({ type: 'jsonb' })
    translation: I18nField;

    @Column({ nullable: true })
    @Index()
    categoryId: string | null;

    @AfterLoad()
    afterLoad() {
        const lang = currentLanguage();
        this.name = this.translation[lang] || this.name;
    }

    @ManyToOne(() => CategoryEntity)
    @JoinColumn({ name: 'categoryId' })
    category: CategoryEntity;

    @ManyToOne(() => CategoryEntity, (category) => category.subIndicators)
    @JoinColumn({ name: 'parentId' })
    indicator: CategoryEntity;

    @OneToMany(() => CategoryEntity, (category) => category.indicator)
    subIndicators: CategoryEntity[];

    clone(): Partial<CategoryEntity> {
        return {
            parentId: this.parentId,
            name: this.name,
            type: this.type,
            category: this.category,
            riskSeverity: this.riskSeverity,
            translation: this.translation
        };
    }
}
