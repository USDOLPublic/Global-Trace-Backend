import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CategoryEntity } from '~categories/entities/category.entity';
import { BaseEntity } from '~core/entities/base.entity';
import { SeverityEnum } from '~grievance-report/enums/severity.enum';
import { OptionTypeEnum } from '~self-assessments/enums/option-type.enum';
import { I18nField } from '~self-assessments/types/i18n-field.type';
import { SelfAssessmentQuestionEntity } from './self-assessment-question.entity';

@Entity('SelfAssessmentQuestionResponse')
export class SelfAssessmentQuestionResponseEntity extends BaseEntity {
    @Column()
    selfAssessmentQuestionId: string;

    @Column()
    option: string;

    @Column({ nullable: true })
    optionType: OptionTypeEnum;

    @Column()
    nextQuestionId: string;

    @Column()
    goTo: number;

    @Column()
    riskLevel: SeverityEnum;

    @Column()
    indicatorId: string;

    @Column()
    subIndicatorId: string;

    @Column({ type: 'jsonb' })
    translation: I18nField;

    @ManyToOne(() => SelfAssessmentQuestionEntity, (selfAssessmentQuestion) => selfAssessmentQuestion.questionResponses)
    @JoinColumn({ name: 'selfAssessmentQuestionId' })
    question: SelfAssessmentQuestionEntity;

    @ManyToOne(() => CategoryEntity)
    @JoinColumn({ name: 'indicatorId' })
    indicator: CategoryEntity;

    @ManyToOne(() => CategoryEntity)
    @JoinColumn({ name: 'subIndicatorId' })
    subIndicator: CategoryEntity;
}
