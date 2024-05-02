import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { I18nField } from '~self-assessments/types/i18n-field.type';

@Entity('SelfAssessmentGroup')
export class SelfAssessmentGroupEntity extends BaseEntity {
    @Column({ type: 'jsonb' })
    title: I18nField;

    @Column()
    order: number;

    @Column()
    roleId: string;

    @OneToMany(() => SelfAssessmentAnswerEntity, (answer) => answer.group)
    answers: SelfAssessmentAnswerEntity[];

    @OneToMany(() => SelfAssessmentQuestionEntity, (question) => question.group)
    questions: SelfAssessmentQuestionEntity[];
}
