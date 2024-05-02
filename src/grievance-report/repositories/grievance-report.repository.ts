import { CustomRepository } from '@diginexhk/typeorm-helper';
import { In } from 'typeorm';
import { BaseRepository } from '~core/repositories/base.repository';
import { GrievanceReportEntity } from '~grievance-report/entities/grievance-report.entity';
import { ReportRiskCommentType } from '~grievance-report/types/report-risk-comment.type';

@CustomRepository(GrievanceReportEntity)
export class GrievanceReportRepository extends BaseRepository<GrievanceReportEntity> {
    getReportRisks(facilityId: string): Promise<ReportRiskCommentType[]> {
        return this.createQueryBuilder('GrievanceReport')
            .innerJoin('GrievanceReport.laborRisks', 'LaborRisk', 'LaborRisk.entityType = :entityType', {
                entityType: GrievanceReportEntity.name
            })
            .where({ facilityId })
            .groupBy('GrievanceReport.id')
            .addGroupBy('LaborRisk.indicatorId')
            .addGroupBy('LaborRisk.subIndicatorId')
            .select('GrievanceReport.id', 'id')
            .addSelect('GrievanceReport.message', 'message')
            .addSelect('EXTRACT(EPOCH FROM "GrievanceReport"."createdAt")::integer', 'createdAt')
            .addSelect('LaborRisk.indicatorId', 'indicatorId')
            .addSelect('LaborRisk.subIndicatorId', 'subIndicatorId')
            .addSelect('MAX(LaborRisk.severity)', 'severity')
            .getRawMany();
    }

    findReportByFacilityId(facilityIds: string[]): Promise<GrievanceReportEntity[]> {
        return this.createQueryBuilder('GrievanceReport')
            .innerJoinAndSelect('GrievanceReport.laborRisks', 'LaborRisk1')
            .leftJoinAndSelect('LaborRisk1.indicator', 'Indicator1')
            .leftJoinAndSelect('Indicator1.category', 'Category1')
            .leftJoinAndSelect('LaborRisk1.subIndicator', 'SubIndicator1')
            .where({ facilityId: In(facilityIds) })
            .leftJoinAndSelect('GrievanceReport.responses', 'GrievanceReportResponse')
            .leftJoinAndSelect('GrievanceReportResponse.laborRisks', 'LaborRisk2')
            .leftJoinAndSelect('LaborRisk2.indicator', 'Indicator2')
            .leftJoinAndSelect('Indicator2.category', 'Category2')
            .leftJoinAndSelect('LaborRisk2.subIndicator', 'SubIndicator2')
            .withDeleted()
            .leftJoinAndSelect('LaborRisk1.creator', 'Creator1')
            .leftJoinAndSelect('Creator1.role', 'Role1')
            .leftJoinAndSelect('LaborRisk2.creator', 'Creator2')
            .leftJoinAndSelect('Creator2.role', 'Role2')
            .addOrderBy('LaborRisk2.createdAt', 'DESC')
            .getMany();
    }
}
