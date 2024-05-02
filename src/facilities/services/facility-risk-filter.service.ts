import { Injectable } from '@nestjs/common';
import { groupBy, isEmpty, uniq } from 'lodash';
import { CategoryEntity } from '~categories/entities/category.entity';
import { CategoryService } from '~categories/services/category.service';
import { GetSupplierDetailQuery } from '~facilities/queries/get-supplier-detail.query';
import { FacilityRepository } from '~facilities/repositories/facility.repository';
import { FacilityRiskFilterDto } from '~risk-assessments/http/dto/facility-risk-filter.dto';
import { FacilityRiskService } from '~risk-assessments/services/facility-risk.service';
import { FacilityRiskType } from '~risk-assessments/types/facility-risk.type';
import { SubIndicatorRiskType } from '~risk-assessments/types/sub-indicator-risk.type';

@Injectable()
export class FacilityRiskFilerService {
    constructor(
        private facilityRepo: FacilityRepository,
        private facilityRiskService: FacilityRiskService,
        private categoryService: CategoryService
    ) {}

    filterRiskData(riskData: FacilityRiskType, filters: FacilityRiskFilterDto) {
        riskData.data = riskData.data
            .map((categoryRisk) => {
                categoryRisk.indicatorRiskData = categoryRisk.indicatorRiskData
                    .map((indicatorRisk) => {
                        indicatorRisk.subIndicatorRiskData = indicatorRisk.subIndicatorRiskData
                            .map((subIndicatorRisk) => this.filterSubIndicatorRisk(subIndicatorRisk, filters))
                            .filter((subIndicatorRisk) => {
                                let hasSubIndicator = true;
                                if (filters.subIndicatorIds?.length) {
                                    hasSubIndicator = filters.subIndicatorIds.includes(
                                        subIndicatorRisk.subIndicator.id
                                    );
                                }
                                return subIndicatorRisk.data.length && hasSubIndicator;
                            });
                        return indicatorRisk;
                    })
                    .filter((indicatorRisk) => {
                        let hasIndicator = true;
                        if (filters.indicatorIds?.length) {
                            hasIndicator = filters.indicatorIds.includes(indicatorRisk.indicator.id);
                        }
                        return indicatorRisk.subIndicatorRiskData.length && hasIndicator;
                    });

                if (filters.sources?.length) {
                    categoryRisk.sourceRiskData = categoryRisk.sourceRiskData.filter(({ source }) =>
                        filters.sources.includes(source)
                    );
                }
                return categoryRisk;
            })
            .filter((categoryRisk) => {
                let hasCategory = true;
                if (filters.categoryIds?.length) {
                    hasCategory = filters.categoryIds.includes(categoryRisk.category.id);
                }
                return categoryRisk.indicatorRiskData.length && hasCategory;
            });
        return riskData;
    }

    private filterSubIndicatorRisk(subIndicatorRisk: SubIndicatorRiskType, filters: FacilityRiskFilterDto) {
        if (filters.sources?.length) {
            subIndicatorRisk.data = subIndicatorRisk.data.filter(({ source }) => filters.sources.includes(source));
        }
        if (filters.fromTime) {
            subIndicatorRisk.data = subIndicatorRisk.data.filter(({ createdAt }) => filters.fromTime <= createdAt);
        }
        if (filters.toTime) {
            subIndicatorRisk.data = subIndicatorRisk.data.filter(({ createdAt }) => filters.toTime >= createdAt);
        }
        return subIndicatorRisk;
    }

    async getFilterValues(supplierId: string, filters: FacilityRiskFilterDto) {
        const facility = await this.facilityRepo.findOne(new GetSupplierDetailQuery(supplierId));
        let riskData = await this.facilityRiskService.getFacilityRisk(facility);
        riskData = this.filterRiskData(riskData, filters);

        const categories = riskData.data.map(({ category }) => category).sort((a, b) => a.name.localeCompare(b.name));

        const reportedIndicators = riskData.data.flatMap(({ indicatorRiskData }) =>
            indicatorRiskData.map(({ indicator, subIndicatorRiskData }) => ({
                indicator,
                subIndicators: subIndicatorRiskData.map(({ subIndicator }) => subIndicator)
            }))
        );
        const groupIndicators = groupBy(reportedIndicators, ({ indicator }) => indicator.id);
        const issues = Object.entries(groupIndicators)
            .map(([indicatorId, groupIndicator]) => ({
                indicator: groupIndicator[0].indicator,
                subIndicators: groupIndicator
                    .flatMap(({ subIndicators }) => subIndicators)
                    .sort((a, b) => a.name.localeCompare(b.name))
            }))
            .sort((a, b) => a.indicator.name.localeCompare(b.indicator.name));

        const sources = uniq(
            riskData.data.flatMap(({ sourceRiskData }) => sourceRiskData.map(({ source }) => source))
        ).sort((a, b) => a.localeCompare(b));

        return { categories, issues, sources };
    }

    async getFilterParams(filters: FacilityRiskFilterDto) {
        const { sources, categoryIds, indicatorIds, subIndicatorIds, fromTime, toTime } = filters;
        let categories: CategoryEntity[];
        let subIndicators: CategoryEntity[] = [];
        let indicators: CategoryEntity[] = [];
        let parentIds: string[] = [];

        if (!isEmpty(categoryIds)) {
            categories = await this.categoryService.findByIds(categoryIds);
        }

        if (!isEmpty(subIndicatorIds)) {
            subIndicators = await this.categoryService.findByIds(subIndicatorIds);
            parentIds = subIndicators.map(({ parentId }) => parentId);
        }

        if (!isEmpty(indicatorIds)) {
            parentIds = parentIds.concat(indicatorIds);
        }

        if (parentIds.length) {
            indicators = await this.categoryService.findByIds(parentIds);
        }

        const issues = indicators.map((indicator) => ({
            indicator,
            subIndicators: subIndicators.filter(({ parentId }) => parentId === indicator.id)
        }));

        return {
            sources,
            categories,
            issues,
            fromTime,
            toTime
        };
    }
}
