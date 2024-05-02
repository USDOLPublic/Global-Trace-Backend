import { Column, Entity } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';

@Entity('GeographicalRiskLevel')
export class GeographicalRiskLevelEntity extends BaseEntity {
    @Column()
    countryId: string;

    @Column()
    risk: number;
}
