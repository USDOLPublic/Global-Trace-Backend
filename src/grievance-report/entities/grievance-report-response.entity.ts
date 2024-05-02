import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { TimestampTransformer } from '~core/transformers/timestamp.transformer';
import { MaxLength } from 'class-validator';
import { ProofUrlTransformer } from '~events/transformers/proof-url.transformer';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { LaborRiskEntity } from './labor-risk.entity';

@Entity('GrievanceReportResponse')
export class GrievanceReportResponseEntity extends BaseEntity {
    @Index()
    @Column()
    grievanceReportId: string;

    @Column({
        type: 'timestamp',
        transformer: new TimestampTransformer()
    })
    recordedAt: number;

    @Column({ nullable: true })
    priority: number;

    @Column()
    @MaxLength(255)
    message: string;

    @Column({ type: 'jsonb', transformer: new ProofUrlTransformer(), nullable: true })
    uploadImages: string[];

    @Column({ nullable: true })
    auditReportNumber: string;

    @ManyToOne(() => GrievanceReportEntity, (grievanceReport) => grievanceReport.responses)
    @JoinColumn({ name: 'grievanceReportId' })
    grievanceReport: GrievanceReportResponseEntity;

    @OneToMany(() => LaborRiskEntity, (laborRisk) => laborRisk.grievanceReportResponse)
    laborRisks: LaborRiskEntity[];
}
