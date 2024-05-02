export type ProductTranslationValidationError = {
    key: string;
    error: string;
    isShowKey: boolean;
};

export type ProductTranslationValidationType = {
    index: number;
    errors: ProductTranslationValidationError[];
    isShowRow: boolean;
};
