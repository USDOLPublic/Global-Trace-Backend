import { RowValidationResultType } from '~files/types/row-validation-result.type';

export type ImportingSupplierResultType = RowValidationResultType & {
    fileId: string;
};
