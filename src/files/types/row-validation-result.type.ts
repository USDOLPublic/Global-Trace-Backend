import { FileDataValidationType } from '~files/types/file-data-validation.type';

export type RowValidationResultType = {
    totalItems: number;
    validatedItemCount: number;
    validationErrors: FileDataValidationType[];
};
