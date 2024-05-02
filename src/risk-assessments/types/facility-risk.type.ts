import { CategoryRiskType } from './category-risk.type';
import { RiskType } from './risk.type';

export type FacilityRiskType = {
    overallRisk: RiskType;
    countryRisk: RiskType;
    data: CategoryRiskType[];
};
