import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { MaxLength } from 'class-validator';
import { BaseEntity } from '~core/entities/base.entity';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { ReasonEnum } from '~grievance-report/enums/reason.enum';
import { UserEntity } from '~users/entities/user.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { ProofUrlTransformer } from '~events/transformers/proof-url.transformer';
import { GrievanceReportResponseEntity } from '~grievance-report/entities/grievance-report-response.entity';
import { LaborRiskEntity } from './labor-risk.entity';
import { IncidentReportStatus } from '~grievance-report/enums/incident-report-status.enum';

@Entity('GrievanceReport')
export class GrievanceReportEntity extends BaseEntity {
    @Index()
    @Column()
    facilityId: string;

    @Column()
    location: string;

    @Column()
    @MaxLength(255)
    message: string;

    @Index()
    @Column({ nullable: true })
    assigneeId: string;

    @Index()
    @Column()
    creatorId: string;

    @Column({ nullable: true })
    reason: ReasonEnum;

    @Column({ default: IncidentReportStatus.NEW })
    status: IncidentReportStatus;

    @Column({ default: false })
    isNoFollowUp: boolean;

    @Column({
        type: 'timestamp',
        transformer: new TimestampTransformer(),
        nullable: true
    })
    recordedAt: number | Date;

    @Column({
        type: 'timestamp',
        transformer: new TimestampTransformer(),
        nullable: true
    })
    latestActivityAt: number | Date;

    @Column({ transformer: new ProofUrlTransformer(), type: 'character varying', default: [], array: true })
    uploadFiles: string[];

    @Column({ nullable: true })
    priority: number;

    @Column({ nullable: true })
    auditReportNumber: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'assigneeId' })
    assignee: UserEntity;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'creatorId' })
    creator: UserEntity;

    @ManyToOne(() => FacilityEntity, (facility) => facility.grievanceReports)
    @JoinColumn({ name: 'facilityId' })
    facility: FacilityEntity;

    @OneToMany(() => GrievanceReportResponseEntity, (response) => response.grievanceReport)
    responses: GrievanceReportResponseEntity[];

    @OneToMany(() => LaborRiskEntity, (laborRisk) => laborRisk.grievanceReport)
    laborRisks: LaborRiskEntity[];
}
