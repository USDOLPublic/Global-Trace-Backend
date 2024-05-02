import { I18nFieldMetadataType } from '~self-assessments/types/i18n-field-metadata.type';
import { RiskScoreLevelEnum } from '~self-assessments/enums/risk-score-level.enum';

export interface ChoiceQuestionMetadata {
    code: string;
    i18n?: I18nFieldMetadataType;
    traceabilityRiskLevel?: RiskScoreLevelEnum;
    laborRiskLevel?: RiskScoreLevelEnum;
    laborRiskType?: any;
}
