import { I18nField } from '~self-assessments/types/i18n-field.type';

export type ValidateAttributeOptionType = {
    index: number;
    attributeIndex: number;
    attributeName;
    options?: { value: string; translation: I18nField }[];
    value: any;
    quantityUnit?: string;
};
