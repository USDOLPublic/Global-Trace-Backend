import { Injectable } from '@nestjs/common';
import { groupBy, isNumber, maxBy, meanBy } from 'lodash';
import { CategoryService } from '~categories/services/category.service';
import { I18nHelper } from '~core/helpers/i18n.helper';
import { DnaRiskService } from '~dna-testing/services/dna-risk.service';
import { FacilityEntity } from '~facilities/entities/facility.entity';
import { AdditionalRoleEnum } from '~facilities/enums/additional-role.enum';
import { GrievanceReportRiskService } from '~grievance-report/services/grievance-report-risk.service';
import GoodsRisk from '~risk-assessments/constants/goods-risk.json';
import { RiskAssessmentEntity } from '~risk-assessments/entities/risk-assessment.entity';
import { MethodologyEnum } from '~risk-assessments/enums/methodology.enum';
import { RiskSourceEnum } from '~risk-assessments/enums/risk-source.enum';
import { RISK_LEVEL_VALUE, convertRiskLevel } from '~risk-assessments/helpers/convert-risk-level.helper';
import { CategoryRiskType } from '~risk-assessments/types/category-risk.type';
import { FacilityRiskType } from '~risk-assessments/types/facility-risk.type';
import { IndicatorRiskType } from '~risk-assessments/types/indicator-risk.type';
import { ResultRiskItemType } from '~risk-assessments/types/result-risk-item.type';
import { RiskItemType } from '~risk-assessments/types/risk-item.type';
import { RiskType } from '~risk-assessments/types/risk.type';
import { SourceRiskType } from '~risk-assessments/types/source-risk.type';
import { SubIndicatorRiskType } from '~risk-assessments/types/sub-indicator-risk.type';
import { GeographicalRiskLevelService } from '~self-assessments/services/geographical-risk-level.service';
import { SelfAssessmentQuestionRiskService } from '~self-assessments/services/self-assessment-question-risk.service';
import { RiskAssessmentService } from './risk-assessment.service';

@Injectable()
export class FacilityRiskService {
    public constructor(
        private riskAssessmentService: RiskAssessmentService,
        private geographicalRiskLevelService: GeographicalRiskLevelService,
        private grievanceReportRiskService: GrievanceReportRiskService,
        private dnaRiskService: DnaRiskService,
        private categoryService: CategoryService,
        private selfAssessmentQuestionRiskService: SelfAssessmentQuestionRiskService
    ) {}

    async getFacilityRisk(facility: FacilityEntity): Promise<FacilityRiskType> {
        const riskMethodology = await this.riskAssessmentService.getRiskAssessment();
        const countryRisk = await this.getCountryRisk(facility);
        const riskItems = await this.getRiskItems(facility);

        const groupCategories = groupBy(riskItems, ({ indicator }) => indicator.categoryId);
        const data = Object.entries(groupCategories)
            .map(([categoryId, groupCategory]) => {
                const groupIndicators = groupBy(groupCategory, ({ indicator }) => indicator.id);
                const indicatorRiskData = Object.entries(groupIndicators)
                    .map(([indicatorId, groupIndicator]) => {
                        const subIndicatorRiskData = this.getSubIndicatorRiskData(
                            facility,
                            riskMethodology,
                            groupIndicator
                        );
                        const score = this.calculateRiskScore(
                            riskMethodology,
                            subIndicatorRiskData.flatMap(({ data }) => data)
                        );
                        const level = convertRiskLevel(score);
                        return { indicator: groupIndicator[0].indicator, risk: { score, level }, subIndicatorRiskData };
                    })
                    .sort(this.sortIndicators);

                const items = indicatorRiskData.flatMap(({ subIndicatorRiskData }) =>
                    subIndicatorRiskData.flatMap(({ data }) => data)
                );
                const sourceRiskData = this.getSourceRiskData(riskMethodology, items);
                const score = this.calculateRiskScore(riskMethodology, items);
                const level = convertRiskLevel(score);
                return {
                    category: groupCategory[0].indicator.category,
                    risk: { score, level },
                    indicatorRiskData,
                    sourceRiskData
                };
            })
            .sort(this.sortCategories);
        const overallScore = this.calculateRiskScore(
            riskMethodology,
            data.flatMap(({ indicatorRiskData }) =>
                indicatorRiskData.flatMap(({ subIndicatorRiskData }) =>
                    subIndicatorRiskData.flatMap(({ data }) => data)
                )
            )
        );
        const overallRisk: RiskType = { score: overallScore, level: convertRiskLevel(overallScore) };
        return { overallRisk, countryRisk, data };
    }

    private getSourceRiskData(
        riskMethodology: RiskAssessmentEntity,
        riskItems: ResultRiskItemType[]
    ): SourceRiskType[] {
        const groupSources = groupBy(riskItems, ({ source }) => source);
        return Object.entries(groupSources)
            .map(([source, groupSource]) => {
                const score = this.calculateRiskScore(riskMethodology, groupSource);
                const level = convertRiskLevel(score);
                return { source, risk: { score, level } };
            })
            .sort((a, b) => {
                const result = RISK_LEVEL_VALUE[a.risk.level] - RISK_LEVEL_VALUE[b.risk.level];
                if (result !== 0) {
                    return result;
                }
                return a.source.localeCompare(b.source);
            });
    }

    private getSubIndicatorRiskItems(
        facility: FacilityEntity,
        groupSubIndicator: RiskItemType[]
    ): ResultRiskItemType[] {
        return groupSubIndicator
            .map((item) => {
                const { createdAt, source, role, severity, subIndicator, facilityId } = item;
                const isSourceIncidentReport = source === RiskSourceEnum.INCIDENT_REPORT;
                const score = severity * subIndicator.riskSeverity;
                return {
                    createdAt,
                    source: isSourceIncidentReport ? role.name : source,
                    roleId: isSourceIncidentReport ? role.id : null,
                    risk: {
                        score,
                        level: convertRiskLevel(score)
                    },
                    note: this.getNote(item),
                    isIndirect: facilityId && facilityId !== facility.id
                };
            })
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    private getSubIndicatorRiskData(
        facility: FacilityEntity,
        riskMethodology: RiskAssessmentEntity,
        groupIndicator: RiskItemType[]
    ): SubIndicatorRiskType[] {
        const groupSubIndicators = groupBy(groupIndicator, ({ subIndicator }) => subIndicator.id);
        return Object.entries(groupSubIndicators)
            .map(([subIndicatorId, groupSubIndicator]) => {
                const data = this.getSubIndicatorRiskItems(facility, groupSubIndicator);
                const score = this.calculateRiskScore(riskMethodology, data);
                const level = convertRiskLevel(score);
                return {
                    subIndicator: groupSubIndicator[0].subIndicator,
                    risk: { score, level },
                    data
                };
            })
            .sort(this.sortSubIndicators);
    }

    private getNote(riskItem: RiskItemType): string {
        switch (riskItem.source) {
            case RiskSourceEnum.PRODUCT_RISK_LISTINGS:
                return riskItem.additionData.good;
            case RiskSourceEnum.INCIDENT_REPORT:
            case RiskSourceEnum.ADMIN:
                return riskItem.additionData.reportMessage;
            case RiskSourceEnum.SAQ:
                const question = I18nHelper.getFieldTranslationText(
                    { translation: riskItem.additionData.saqAnswer.question.title },
                    'title'
                );
                const response = I18nHelper.getFieldTranslationText(riskItem.additionData.saqAnswer.response, 'option');
                return `${question} ${response}`;
            default:
                return null;
        }
    }

    async calculateRisk(riskItems: ResultRiskItemType[]): Promise<RiskType> {
        const riskMethodology = await this.riskAssessmentService.getRiskAssessment();
        return this.calculateRiskByMethodology(riskItems, riskMethodology);
    }

    private calculateRiskByMethodology(
        riskItems: ResultRiskItemType[],
        riskMethodology: RiskAssessmentEntity
    ): RiskType {
        const score = this.calculateRiskScore(riskMethodology, riskItems);
        const level = convertRiskLevel(score);
        return { score, level };
    }

    private calculateRiskScore(riskMethodology: RiskAssessmentEntity, riskItems: ResultRiskItemType[]): number {
        switch (riskMethodology.methodology) {
            case MethodologyEnum.AVERAGE_RISK:
                return this.calculateAvgScore(riskItems);
            case MethodologyEnum.HIGHEST_RISK:
                return this.calculateMaxScore(riskItems);
            default:
                return this.calculateWeightedScore(riskMethodology, riskItems);
        }
    }

    private calculateMaxScore(riskItems: ResultRiskItemType[]): number {
        if (riskItems.length) {
            return maxBy(riskItems, ({ risk }) => risk.score).risk.score;
        }
    }

    private calculateAvgScore(riskItems: ResultRiskItemType[]): number {
        return meanBy(riskItems, ({ risk }) => risk.score);
    }

    private calculateWeightedScore(riskMethodology: RiskAssessmentEntity, riskItems: ResultRiskItemType[]): number {
        let sum = 0;
        let factorSum = 0;
        for (const riskItem of riskItems) {
            const factor = this.getFactor(riskMethodology, riskItem);
            sum += riskItem.risk.score * factor;
            factorSum += factor;
        }

        if (factorSum === 0) {
            return 0;
        }
        return sum / factorSum;
    }

    private getFactor(riskMethodology: RiskAssessmentEntity, riskItem: ResultRiskItemType): number {
        switch (riskItem.source) {
            case RiskSourceEnum.PRODUCT_RISK_LISTINGS:
                return riskMethodology.listOfGoodsWeight;
            case RiskSourceEnum.DNA_TEST_RESULTS:
                return riskMethodology.dnaWeight;
            case RiskSourceEnum.SAQ:
                return riskMethodology.saqsWeight;
            case RiskSourceEnum.ADMIN:
                return riskMethodology.hotlineWeight;
            default:
                return riskMethodology.roleWeights.find(({ roleId }) => roleId === riskItem.roleId)?.weight ?? 0;
        }
    }

    private async getRiskItems(facility: FacilityEntity) {
        const facilityIds = [facility.id];
        if (facility.additionalRole === AdditionalRoleEnum.FARM_GROUP) {
            await facility.loadRelation('farms');
            facility.farms.forEach((farm) => {
                facilityIds.push(farm.id);
            });
        }

        const reportFacilityIds = [...facilityIds];
        if (facility.farmGroupId) {
            reportFacilityIds.push(facility.farmGroupId);
        }

        const [dnaRiskItems, goodRiskItems, reportRiskItems, saqRiskItem] = await Promise.all([
            this.dnaRiskService.getDnaRiskItems(facilityIds),
            this.getProductRiskListingsItems(facility),
            this.grievanceReportRiskService.getRiskItems(reportFacilityIds),
            this.selfAssessmentQuestionRiskService.getRiskItems(facilityIds)
        ]);
        const riskItems = dnaRiskItems.concat(goodRiskItems, reportRiskItems, saqRiskItem);
        return riskItems.filter(({ indicator, subIndicator, severity }) => severity && indicator && subIndicator);
    }

    private async getProductRiskListingsItems(facility: FacilityEntity): Promise<RiskItemType[]> {
        return Promise.all(
            GoodsRisk.filter(
                ({ country, good }) =>
                    facility.country?.country?.toLowerCase() === country.toLowerCase() && facility.goods.includes(good)
            ).map(async ({ indicator: indicatorName, subIndicator: subIndicatorName, severity, good }) => {
                const { indicator, subIndicator } = await this.categoryService.getComboIndicatorAndSubIndicator(
                    indicatorName,
                    subIndicatorName
                );
                return {
                    indicator,
                    subIndicator,
                    severity,
                    source: RiskSourceEnum.PRODUCT_RISK_LISTINGS,
                    createdAt: facility.createdAt,
                    additionData: { good }
                };
            })
        );
    }

    private async getCountryRisk(facility: FacilityEntity): Promise<RiskType> {
        const score = await this.geographicalRiskLevelService.getCountryRiskScore(facility);
        return {
            score,
            level: isNumber(score) ? convertRiskLevel((score * 15) / 100) : null
        };
    }

    private sortCategories(a: CategoryRiskType, b: CategoryRiskType): number {
        const result = RISK_LEVEL_VALUE[a.risk.level] - RISK_LEVEL_VALUE[b.risk.level];
        if (result !== 0) {
            return result;
        }
        return a.category.name.localeCompare(b.category.name);
    }

    private sortIndicators(a: IndicatorRiskType, b: IndicatorRiskType): number {
        const result = RISK_LEVEL_VALUE[a.risk.level] - RISK_LEVEL_VALUE[b.risk.level];
        if (result !== 0) {
            return result;
        }
        return a.indicator.name.localeCompare(b.indicator.name);
    }

    private sortSubIndicators(a: SubIndicatorRiskType, b: SubIndicatorRiskType): number {
        const result = RISK_LEVEL_VALUE[a.risk.level] - RISK_LEVEL_VALUE[b.risk.level];
        if (result !== 0) {
            return result;
        }
        return a.subIndicator.name.localeCompare(b.subIndicator.name);
    }
}
