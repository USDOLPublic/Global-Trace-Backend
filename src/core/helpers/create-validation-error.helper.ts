import { ValidationError } from '@diginexhk/nestjs-exception';

export const createValidationError = (error: {
    property: string;
    message?: string;
    detail?: any;
    children?: ValidationError[];
}): ValidationError => {
    const { property, message, detail, children } = error;

    return {
        property,
        children,
        constraints: {
            invalidField: {
                message,
                detail: detail || {}
            } as any
        }
    };
};
