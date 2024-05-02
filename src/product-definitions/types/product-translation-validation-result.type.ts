import { ProductTranslationValidationType } from './product-translation-validation-error.type';

export type ProductTranslationValidationResultType = {
    totalItems: number;
    validatedItemCount: number;
    validationErrors: ProductTranslationValidationType[];
};
