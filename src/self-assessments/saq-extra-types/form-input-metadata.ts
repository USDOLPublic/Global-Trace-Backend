import { I18nFieldMetadataType } from '~self-assessments/types/i18n-field-metadata.type';
import { BaseSaqMetadata } from '~self-assessments/saq-extra-types/base-saq-metadata';

export interface FormInputMetadata extends BaseSaqMetadata {
    columnWidth?: number;
    placeholder: I18nFieldMetadataType;
}
