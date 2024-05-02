import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';
import { InputRuleMetadata } from '~self-assessments/saq-extra-types/input-rule-metadata';

export interface FreeInputValueMetadata {
    traceabilityRiskLevel?: RiskScoreLevelEnum | string;
    laborRiskLevel?: RiskScoreLevelEnum | string;
    laborRiskType?: any;
    answerValueValidateSchema?: InputRuleMetadata[];
    label?: string;
    code?: string;
}
