import { Column, Entity } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { FloatTransformer } from '~core/transformers/float.transformer';
import { MethodologyEnum } from '~risk-assessments/enums/methodology.enum';
import { RoleWeightType } from '~risk-assessments/types/roles-weight.type';

@Entity('RiskAssessment')
export class RiskAssessmentEntity extends BaseEntity {
    @Column()
    methodology: MethodologyEnum;

    @Column({ nullable: true, type: 'decimal', precision: 14, scale: 2, transformer: new FloatTransformer() })
    saqsWeight: number | null;

    @Column({ nullable: true, type: 'decimal', precision: 14, scale: 2, transformer: new FloatTransformer() })
    dnaWeight: number | null;

    @Column({ nullable: true, type: 'decimal', precision: 14, scale: 2, transformer: new FloatTransformer() })
    geographyWeight: number | null;

    @Column({ nullable: true, type: 'decimal', precision: 14, scale: 2, transformer: new FloatTransformer() })
    listOfGoodsWeight: number | null;

    @Column({ nullable: true, type: 'decimal', precision: 14, scale: 2, transformer: new FloatTransformer() })
    hotlineWeight: number | null;

    @Column({ nullable: true, type: 'jsonb' })
    roleWeights: RoleWeightType[];
}
