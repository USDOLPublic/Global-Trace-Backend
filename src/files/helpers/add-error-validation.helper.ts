import { AddErrorValidationType } from '~facilities/types/add-error-validation.type';
import { ErrorTypeEnum } from '~files/enums/error-type.enum';
import * as Joi from 'joi';
import { FileDataValidationType, FileValidationError } from '~files/types/file-data-validation.type';
import { keyBy } from 'lodash';
import { trans } from '@diginexhk/nestjs-cls-translation';

export function standardizeJoiErrorMessage(message: string) {
    return message.replace(`\"`, '').replace(`\"`, '');
}

// eslint-disable-next-line max-lines-per-function
function generateErrorMessage(
    errorType: ErrorTypeEnum,
    isBlankRow: boolean,
    currentValue?: string,
    errors: Joi.ValidationErrorItem[] = []
): FileValidationError[] {
    switch (errorType) {
        case ErrorTypeEnum.DUPLICATED_ID_IN_FARM_TEMPLATE:
            return [
                {
                    key: 'id',
                    currentValue,
                    error: 'ID has been duplicated in file template',
                    isBlankRow
                }
            ];
        case ErrorTypeEnum.INVALID_FARM_ID:
            return [
                {
                    key: 'id',
                    currentValue,
                    error: `Farm ID is invalid format. The valid format is *xxx*, example 111 or 222`,
                    isBlankRow
                }
            ];
        case ErrorTypeEnum.DUPLICATED_EMAIL_IN_FILE_TEMPLATE:
            return [
                {
                    key: 'email',
                    currentValue,
                    error: 'Email has been duplicated in file template',
                    isBlankRow
                }
            ];
        case ErrorTypeEnum.EXISTED_FACILITY_EMAIL_IN_DATABASE:
            return [
                {
                    key: 'email',
                    currentValue,
                    error: 'Email is already assigned to another business',
                    isBlankRow
                }
            ];
        case ErrorTypeEnum.EXISTED_FACILITY_OARID_IN_DATABASE:
            return [
                {
                    key: 'oarId',
                    currentValue,
                    error: 'OS ID is already assigned to another business',
                    isBlankRow
                }
            ];
        case ErrorTypeEnum.EXISTED_FACILITY_IN_DATABASE:
            return [
                {
                    key: '',
                    currentValue,
                    error: 'Supplier already exists in the system. Skipping row..',
                    isBlankRow
                }
            ];
        case ErrorTypeEnum.INVALID_COORDINATE:
            const [latitude, longitude] = currentValue.split(',');
            return [
                {
                    key: 'latitude_longitude',
                    currentValue: `${latitude}/${longitude}`,
                    error: trans('import.invalid_value_latitude_longitude'),
                    isBlankRow
                }
            ];
        case ErrorTypeEnum.SAQ_HAS_NOT_COMPLETE:
            return [
                {
                    key: '',
                    currentValue: '',
                    error: trans('error.SAQ has not been completed'),
                    isBlankRow
                }
            ];
        default:
            return errors.map(({ context, message }) => ({
                key: context.key,
                currentValue: context.value,
                error: standardizeJoiErrorMessage(message),
                isBlankRow
            }));
    }
}

function filterErrors(errors: FileDataValidationType[]): void {
    const regex = new RegExp('required');
    for (const [index, item] of Object.entries(errors)) {
        const requireErrors = item.errors.filter(({ error }) => regex.test(error));
        const requireErrorsGroupByKey = keyBy(requireErrors, 'key');

        item.errors = item.errors.filter(({ error, key }) => {
            const isRequiredError = regex.test(error);
            const matchedRequiredKey = requireErrorsGroupByKey[key]?.key;

            return isRequiredError || !matchedRequiredKey;
        });

        const checkIfBlankRow = item.errors.some(({ isBlankRow }) => isBlankRow);
        if (checkIfBlankRow) {
            errors.splice(+index, 1);
        }
    }
}

export function addErrorValidation({
    currentListErrors,
    errors,
    errorType,
    currentRowIndex,
    currentValue,
    sheet,
    isBlankRow
}: AddErrorValidationType) {
    const existedErrorInRow = currentListErrors.find((error) => error.index === currentRowIndex);
    if (existedErrorInRow) {
        existedErrorInRow.errors.push(...generateErrorMessage(errorType, isBlankRow, currentValue, errors));
    } else {
        currentListErrors.push({
            index: currentRowIndex,
            errors: generateErrorMessage(errorType, isBlankRow, currentValue, errors),
            isShowRow: true,
            sheet
        });
    }
    filterErrors(currentListErrors);
}

export function checkIsNotInputLatLng(errorValidation: Joi.ValidationError): boolean {
    return errorValidation?.details.some((error) => {
        const checkLatRegex = new RegExp('Latitude is required');
        const checkLngRegex = new RegExp('Longitude is required');

        return checkLatRegex.test(error.message) || checkLngRegex.test(error.message);
    });
}
