import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { I18nField } from '~self-assessments/types/i18n-field.type';
import { SelfAssessmentGroupEntity } from '~self-assessments/entities/self-assessment-group.entity';
import { SaqMetadataType } from '~self-assessments/types/saq-metadata.type';
import { OrderEntity } from '~order/entities/order.entity';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { SelfAssessmentQuestionTypesEnum } from '~self-assessments/enums/self-assessment-question-types.enum.';
import { ConditionQuestionType } from '~self-assessments/types/conditions-question.type';
import { SelfAssessmentQuestionResponseEntity } from './self-assessment-question-response.entity';

@Entity('SelfAssessmentQuestion')
export class SelfAssessmentQuestionEntity extends BaseEntity {
    @Column({ nullable: true })
    groupId: string;

    @Column({ type: 'jsonb' })
    title: I18nField;

    @Column()
    order: number;

    @Column()
    type: SelfAssessmentQuestionTypesEnum;

    @Column({ default: false })
    isRequired: boolean;

    @Column({ type: 'jsonb' })
    conditions: ConditionQuestionType[];

    @Column({ type: 'jsonb' })
    metadata: SaqMetadataType;

    @ManyToOne(() => SelfAssessmentGroupEntity)
    @JoinColumn({ name: 'groupId' })
    group: SelfAssessmentGroupEntity[];

    @OneToMany(() => OrderEntity, (orders) => orders.facility)
    answers: SelfAssessmentAnswerEntity[];

    @OneToMany(
        () => SelfAssessmentQuestionResponseEntity,
        (selfAssessmentQuestionResponse) => selfAssessmentQuestionResponse.question
    )
    questionResponses: SelfAssessmentQuestionResponseEntity[];
}
