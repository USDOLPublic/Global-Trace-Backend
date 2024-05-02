import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';

@Entity('SelfAssessment')
export class SelfAssessmentEntity extends BaseEntity {
    @Column()
    forFacilityId: string;

    @Column()
    totalQuestions: number;

    @Column({ default: 0 })
    totalDraftAnswers: number;

    @Column({ nullable: true })
    onGoingAnswerAtGroupId: string;

    @Column({ nullable: true })
    onGoingAnswerAtQuestionId: string;

    @Column({
        type: 'timestamp',
        nullable: true,
        transformer: new TimestampTransformer()
    })
    completedSaqAt: number | Date;

    @OneToOne(() => FacilityEntity, (facility: FacilityEntity) => facility.selfAssessment)
    @JoinColumn({ name: 'forFacilityId' })
    forFacility: FacilityEntity;

    @OneToMany(() => SelfAssessmentAnswerEntity, (answer) => answer.selfAssessment)
    answers: SelfAssessmentAnswerEntity[];

    @Column({ type: 'double precision', select: false, insert: false, update: false, readonly: true, nullable: true })
    countryLaborRiskScore: number;

    @Column({ type: 'double precision', select: false, insert: false, update: false, readonly: true, nullable: true })
    provinceLaborRiskScore: number;

    @Column({ type: 'double precision', select: false, insert: false, update: false, readonly: true, nullable: true })
    districtLaborRiskScore: number;

    @Column({ type: 'double precision', select: false, insert: false, update: false, readonly: true, nullable: true })
    riskAssessmentScore: number;
}
