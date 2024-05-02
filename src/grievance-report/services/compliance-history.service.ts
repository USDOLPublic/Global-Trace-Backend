import { Injectable } from '@nestjs/common';
import { GrievanceReportRepository } from '~grievance-report/repositories/grievance-report.repository';
import { GrievanceReportResponseRepository } from '~grievance-report/repositories/grievance-report-response.repository';
import { CategoryService } from '~categories/services/category.service';
import { CategoryTypeEnum } from '~categories/enums/category-type.enum';
import { groupBy, keyBy } from 'lodash';
import { ReportRiskType } from '~grievance-report/types/report-risk.type';

@Injectable()
export class ComplianceHistoryService {
    constructor(
        private grievanceReportRepo: GrievanceReportRepository,
        private grievanceReportResponseRepo: GrievanceReportResponseRepository,
        private categoryService: CategoryService
    ) {}

    async getComplianceHistory(facilityId: string): Promise<ReportRiskType[]> {
        const [indicators, subIndicators, reportRisks, responseRisks] = await Promise.all([
            this.categoryService.all({ type: CategoryTypeEnum.INDICATOR }),
            this.categoryService.all({ type: CategoryTypeEnum.SUB_INDICATOR }),
            this.grievanceReportRepo.getReportRisks(facilityId),
            this.grievanceReportResponseRepo.getResponseRisks(facilityId)
        ]);

        const mapIndicator = keyBy(indicators, 'id');
        const mapSubIndicator = keyBy(subIndicators, 'id');

        const risks = reportRisks.concat(responseRisks);
        const complianceHistory: ReportRiskType[] = [];

        const indicatorGroups = Object.entries(groupBy(risks, 'indicatorId'));
        for (const [indicatorId, indicatorGroup] of indicatorGroups) {
            const indicator = mapIndicator[indicatorId];

            const subIndicatorGroups = Object.entries(groupBy(indicatorGroup, 'subIndicatorId'));
            for (const [subIndicatorId, subIndicatorGroup] of subIndicatorGroups) {
                subIndicatorGroup.sort((a, b) => b.createdAt - a.createdAt);
                complianceHistory.push({
                    indicator,
                    subIndicator: mapSubIndicator[subIndicatorId],
                    comments: subIndicatorGroup
                });
            }
        }

        complianceHistory.sort((a, b) => this.getLatestCreatedAt(b) - this.getLatestCreatedAt(a));

        return complianceHistory;
    }

    private getLatestCreatedAt(item: ReportRiskType) {
        return Math.max(...item.comments.map(({ createdAt }) => createdAt));
    }
}
