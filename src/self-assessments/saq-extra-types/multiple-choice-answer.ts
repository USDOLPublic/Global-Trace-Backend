import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export interface MultipleChoiceAnswer {
    value: {
        answerCode: string;
        traceabilityRiskLevel: RiskScoreLevelEnum;
        laborRiskLevel: RiskScoreLevelEnum;
    }[];
}
