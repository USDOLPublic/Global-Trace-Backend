import { RiskScoreLevelFormulaType } from './risk-score-level-formula.type';

export type RiskScoreFormulaType = {
    facilityType: string;
    laborRisk: RiskScoreLevelFormulaType;
    productRisk?: RiskScoreLevelFormulaType;
    overallRisk: RiskScoreLevelFormulaType;
};
