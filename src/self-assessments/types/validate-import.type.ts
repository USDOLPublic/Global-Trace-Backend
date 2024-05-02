import { FileDataValidationType } from '~files/types/file-data-validation.type';

export type ValidateImportType = { validatedItemCount: number; validationErrors: FileDataValidationType[] };
