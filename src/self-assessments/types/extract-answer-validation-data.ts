import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export type ExtractAnswerValidationData = {
    validCode?: string;
    validValue?: string;
    traceabilityRiskLevel?: RiskScoreLevelEnum | string;
    laborRiskLevel?: RiskScoreLevelEnum | string;
    laborRiskType?: any;
    isOther?: boolean;
    placeholder?: string;
};
