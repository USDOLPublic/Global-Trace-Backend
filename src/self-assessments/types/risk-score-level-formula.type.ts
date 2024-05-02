import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export type RiskScoreLevelFormulaType = {
    [RiskScoreLevelEnum.LOW]: number[];
    [RiskScoreLevelEnum.MEDIUM]: number[];
    [RiskScoreLevelEnum.HIGH]: number[];
};
