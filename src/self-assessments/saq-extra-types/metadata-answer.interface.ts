import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export interface MetadataAnswerInterface {
    traceabilityRiskLevel: RiskScoreLevelEnum;
    laborRiskLevel: RiskScoreLevelEnum;
}
