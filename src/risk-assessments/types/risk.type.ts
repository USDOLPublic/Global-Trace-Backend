import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export type RiskType = {
    score: number;
    level: RiskScoreLevelEnum;
};
