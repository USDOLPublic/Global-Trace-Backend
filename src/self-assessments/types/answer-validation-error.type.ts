import { I18nField } from './i18n-field.type';

export type ValidationError = {
    questionOrder: number;
    error: string;
    title: I18nField;
};

export type AnswerValidationError = {
    errors: ValidationError[];
};
