import { BaseEntity } from '~core/entities/base.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { ProvinceEntity } from '~locations/entities/province.entity';
import { I18nField } from '~self-assessments/types/i18n-field.type';

@Entity('District')
export class DistrictEntity extends BaseEntity {
    @Column({ nullable: true })
    provinceId: string;

    @Column()
    districtCode: number;

    @Index()
    @Column()
    district: string;

    @ManyToOne(() => ProvinceEntity)
    province: ProvinceEntity;

    @Column({ type: 'jsonb' })
    translation: I18nField;
}
