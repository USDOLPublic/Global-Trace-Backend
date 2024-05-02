import { BaseEntity } from '~core/entities/base.entity';
import { LowerTransformer } from '~core/transformers/lower.transformer';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { CountryEntity } from '~locations/entities/country.entity';
import { DistrictEntity } from './district.entity';
import { I18nField } from '~self-assessments/types/i18n-field.type';

@Entity('Province')
export class ProvinceEntity extends BaseEntity {
    @Column()
    countryId: string;

    @Column({ length: 2, transformer: new LowerTransformer() })
    provinceCode: string;

    @Index()
    @Column()
    province: string;

    @ManyToOne(() => CountryEntity)
    country: CountryEntity;

    @OneToMany(() => DistrictEntity, (district) => district.province)
    districts: DistrictEntity[];

    @Column({ type: 'jsonb' })
    translation: I18nField;
}
