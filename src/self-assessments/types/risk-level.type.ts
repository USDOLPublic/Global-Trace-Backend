import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export type RiskLevelType = {
    overallRiskScore: number;
    overallRiskLevel: RiskScoreLevelEnum;
    laborRiskScore: number;
    laborRiskLevel: RiskScoreLevelEnum;
    productRiskScore?: number;
    productRiskLevel?: RiskScoreLevelEnum;
};
