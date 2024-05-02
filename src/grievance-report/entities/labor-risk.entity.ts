import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '~core/entities/base.entity';
import { CategoryEntity } from '~categories/entities/category.entity';
import { GrievanceReportEntity } from './grievance-report.entity';
import { GrievanceReportResponseEntity } from './grievance-report-response.entity';
import { SeverityEnum } from '~grievance-report/enums/severity.enum';
import { UserEntity } from '~users/entities/user.entity';

@Entity('LaborRisk')
export class LaborRiskEntity extends BaseEntity {
    @Column()
    entityId: string;

    @Column()
    entityType: string;

    @Index()
    @Column()
    indicatorId: string;

    @Index()
    @Column()
    subIndicatorId: string;

    @Column()
    creatorId: string;

    @Column()
    severity: SeverityEnum;

    @ManyToOne(() => CategoryEntity)
    @JoinColumn({ name: 'indicatorId' })
    indicator: CategoryEntity;

    @ManyToOne(() => CategoryEntity)
    @JoinColumn({ name: 'subIndicatorId' })
    subIndicator: CategoryEntity;

    @ManyToOne(() => GrievanceReportEntity, (grievanceReport) => grievanceReport.laborRisks)
    @JoinColumn({ name: 'entityId' })
    grievanceReport: GrievanceReportEntity;

    @ManyToOne(() => GrievanceReportResponseEntity, (grievanceReportResponse) => grievanceReportResponse.laborRisks)
    @JoinColumn({ name: 'entityId' })
    grievanceReportResponse: GrievanceReportResponseEntity;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'creatorId' })
    creator: UserEntity;
}
