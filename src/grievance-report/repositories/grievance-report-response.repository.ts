import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { GrievanceReportResponseEntity } from '~grievance-report/entities/grievance-report-response.entity';
import { ReportRiskCommentType } from '~grievance-report/types/report-risk-comment.type';

@CustomRepository(GrievanceReportResponseEntity)
export class GrievanceReportResponseRepository extends BaseRepository<GrievanceReportResponseEntity> {
    getResponseRisks(facilityId: string): Promise<ReportRiskCommentType[]> {
        return this.createQueryBuilder('GrievanceReportResponse')
            .innerJoin(
                'GrievanceReportResponse.laborRisks',
                'ResponseLaborRisk',
                'ResponseLaborRisk.entityType = :responseEntityType',
                { responseEntityType: GrievanceReportResponseEntity.name }
            )
            .innerJoin('GrievanceReportResponse.grievanceReport', 'GrievanceReport')
            .where('GrievanceReport.facilityId = :facilityId', { facilityId })
            .groupBy('GrievanceReportResponse.id')
            .addGroupBy('ResponseLaborRisk.indicatorId')
            .addGroupBy('ResponseLaborRisk.subIndicatorId')
            .select('GrievanceReportResponse.id', 'id')
            .addSelect('GrievanceReportResponse.message', 'message')
            .addSelect('EXTRACT(EPOCH FROM "GrievanceReportResponse"."createdAt")::integer', 'createdAt')
            .addSelect('ResponseLaborRisk.indicatorId', 'indicatorId')
            .addSelect('ResponseLaborRisk.subIndicatorId', 'subIndicatorId')
            .addSelect('MAX(ResponseLaborRisk.severity)', 'severity')
            .getRawMany();
    }
}
