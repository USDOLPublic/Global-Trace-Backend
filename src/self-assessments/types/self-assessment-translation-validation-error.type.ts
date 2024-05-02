import { ProductTranslationValidationError } from '~product-definitions/types/product-translation-validation-error.type';

export type TranslationValidationError = ProductTranslationValidationError;

export type SelfAssessmentTranslationValidationError = {
    index: number;
    errors: TranslationValidationError[];
};
