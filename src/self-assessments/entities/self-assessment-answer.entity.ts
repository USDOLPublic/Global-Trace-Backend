import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { SelfAssessmentEntity } from '~self-assessments/entities/self-assessment.entity';
import { AnswerValue } from '~self-assessments/types/answer-value.type';
import { SelfAssessmentGroupEntity } from './self-assessment-group.entity';

@Entity('SelfAssessmentAnswer')
export class SelfAssessmentAnswerEntity extends BaseEntity {
    @Column()
    selfAssessmentId: string;

    @Column()
    groupId: string;

    @Column()
    selfAssessmentQuestionId: string;

    @Column({ type: 'jsonb' })
    values: AnswerValue[];

    @Column()
    isDraft: boolean;

    @Column({ type: 'jsonb' })
    answer: any;

    @DeleteDateColumn({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    deletedAt: Date;

    @ManyToOne(() => SelfAssessmentEntity, (selfAssessment) => selfAssessment.answers)
    @JoinColumn({ name: 'selfAssessmentId' })
    selfAssessment: SelfAssessmentEntity;

    @ManyToOne(() => SelfAssessmentQuestionEntity, (question) => question.answers)
    @JoinColumn({ name: 'selfAssessmentQuestionId' })
    question: SelfAssessmentQuestionEntity;

    @ManyToOne(() => SelfAssessmentGroupEntity, (group) => group.answers)
    @JoinColumn({ name: 'groupId' })
    group: SelfAssessmentGroupEntity;
}
