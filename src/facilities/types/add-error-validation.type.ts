import { FileDataValidationType } from '~files/types/file-data-validation.type';
import { ErrorTypeEnum } from '~files/enums/error-type.enum';
import { SHEET_NAMES } from '~facilities/constants/farm-group-template.constants';
import * as Joi from 'joi';

export type AddErrorValidationType = {
    currentListErrors: FileDataValidationType[];
    currentRowIndex: number;
    errorType: ErrorTypeEnum;
    isBlankRow?: boolean;
    sheet?: typeof SHEET_NAMES[number];
    errors?: Joi.ValidationErrorItem[];
    currentValue?: string;
};
