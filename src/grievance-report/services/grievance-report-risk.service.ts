import { Injectable } from '@nestjs/common';
import { LaborRiskEntity } from '~grievance-report/entities/labor-risk.entity';
import { GrievanceReportRepository } from '~grievance-report/repositories/grievance-report.repository';
import { RiskSourceEnum } from '~risk-assessments/enums/risk-source.enum';
import { RiskItemType } from '~risk-assessments/types/risk-item.type';
import { RoleEntity } from '~role-permissions/entities/role.entity';
import { RoleTypeEnum } from '~role-permissions/enums/role-type.enum';

@Injectable()
export class GrievanceReportRiskService {
    constructor(private grievanceReportRepo: GrievanceReportRepository) {}

    async getRiskItems(facilityIds: string[]): Promise<RiskItemType[]> {
        const grievanceReports = await this.grievanceReportRepo.findReportByFacilityId(facilityIds);

        return grievanceReports.flatMap(({ facilityId, responses, message, laborRisks }) => {
            const riskItems: RiskItemType[] = [];

            const addItems = (reportMessage: string, laborRiskItems: LaborRiskEntity[]) => {
                laborRiskItems.forEach(
                    ({ creator, severity, createdAt, indicatorId, subIndicatorId, indicator, subIndicator }) => {
                        const duplicatePairs = riskItems.filter(
                            ({ indicator, subIndicator }) =>
                                indicator?.id === indicatorId && subIndicator?.id === subIndicatorId
                        );
                        if (!duplicatePairs.length) {
                            riskItems.push({
                                facilityId,
                                severity,
                                indicator,
                                subIndicator,
                                createdAt,
                                role: creator.role,
                                source: this.getSource(creator.role),
                                additionData: {
                                    reportMessage
                                }
                            });
                        }
                    }
                );
            };

            responses.forEach(({ message: resMessage, laborRisks: resLaborRisks }) =>
                addItems(resMessage, resLaborRisks)
            );

            addItems(message, laborRisks);

            return riskItems;
        });
    }

    private getSource(role: RoleEntity): RiskSourceEnum {
        if (role.type === RoleTypeEnum.ADMINISTRATOR) {
            return RiskSourceEnum.ADMIN;
        }

        return RiskSourceEnum.INCIDENT_REPORT;
    }
}
