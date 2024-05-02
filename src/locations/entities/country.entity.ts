import { BaseEntity } from '~core/entities/base.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ProvinceEntity } from './province.entity';
import { I18nField } from '~self-assessments/types/i18n-field.type';

@Entity('Country')
export class CountryEntity extends BaseEntity {
    @Column({ length: 2 })
    countryCode: string;

    @Index()
    @Column()
    country: string;

    @OneToMany(() => ProvinceEntity, (province) => province.country)
    provinces: ProvinceEntity[];

    @Column({ type: 'jsonb' })
    translation: I18nField;
}
