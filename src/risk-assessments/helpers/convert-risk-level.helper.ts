import { isNumber } from 'lodash';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export function convertRiskLevel(score?: number): RiskScoreLevelEnum {
    if (isNumber(score)) {
        switch (true) {
            case score >= 11.26:
                return RiskScoreLevelEnum.EXTREME;
            case score >= 7.51:
                return RiskScoreLevelEnum.HIGH;
            case score >= 3.76:
                return RiskScoreLevelEnum.MEDIUM;
            default:
                return RiskScoreLevelEnum.LOW;
        }
    }
}

export const RISK_LEVEL_VALUE = {
    [RiskScoreLevelEnum.LOW]: 3,
    [RiskScoreLevelEnum.MEDIUM]: 2,
    [RiskScoreLevelEnum.HIGH]: 1,
    [RiskScoreLevelEnum.EXTREME]: 0
};
