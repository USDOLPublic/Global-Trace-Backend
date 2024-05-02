import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export type RiskScoreByGroupIdType = {
    [groupId: string]: {
        [riskAssessmentType: string]: {
            score: number;
            level?: RiskScoreLevelEnum;
        };
    };
};
