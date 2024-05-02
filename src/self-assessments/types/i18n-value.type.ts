import { I18nFieldMetadataType } from '~self-assessments/types/i18n-field-metadata.type';

export type I18nValueType = {
    code: string;
    i18n?: I18nFieldMetadataType;
    riskScore?: number;
};
