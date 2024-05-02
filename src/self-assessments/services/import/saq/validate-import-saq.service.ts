import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidateImportType } from '~self-assessments/types/validate-import.type';
import { FileDataValidationType, FileValidationError } from '~files/types/file-data-validation.type';
import { HeaderSheetType } from '~self-assessments/types/header-sheet.type';
import {
    COMMUNITY_SHEET_NAME,
    GROUP_QUESTION_COLUMN_NAMES,
    LABOR_SHEET_NAME,
    PRODUCT_SHEET_NAME,
    RESPONSE_TYPES,
    SHEET_IMPORT_FACILITY_GROUP_SAQ_NAMES,
    SHEET_IMPORT_SAQ_NAMES
} from '~self-assessments/constants/import-saq.constant';
import { ExcelToJsonResultType, RowDataType } from '~self-assessments/types/excel-to-json-result.type';
import { GetDataExcelService } from '~self-assessments/services/import/get-data-excel.service';
import { ImportGroupQuestionService } from '~self-assessments/services/import/saq/import-group-question.service';
import { trans } from '@diginexhk/nestjs-cls-translation';
import { isEmpty, isNil, uniq } from 'lodash';
import { trimValue } from '~core/helpers/string.helper';
import {
    TOTAL_NUMBER_FEMALE_WORKER,
    TOTAL_NUMBER_MALE_WORKER
} from '~self-assessments/constants/upload-facility-group-template.constant';

@Injectable()
export class ValidateImportSaqService {
    constructor(
        private getDataExcelService: GetDataExcelService,
        private importGroupQuestionService: ImportGroupQuestionService
    ) {}

    async validate(file: Express.Multer.File, canAdminCompletesProfile: boolean): Promise<ValidateImportType> {
        const dataHeader = await this.getDataExcelService.getHeaderRowsFromFile(file);
        const dataImport = await this.getDataExcelService.getDataFromFile(file);

        let validationErrors: FileDataValidationType[] = [];

        this.validateEnoughSheets(dataHeader, canAdminCompletesProfile);
        if (validationErrors.length) {
            return { validatedItemCount: 0, validationErrors };
        }

        this.validateEnoughColumnsInEachSheet(dataHeader, validationErrors);
        if (validationErrors.length) {
            return { validatedItemCount: 0, validationErrors };
        }

        const validatedItemCount = await this.validateDataInEachSheet(dataImport, validationErrors);

        return { validatedItemCount, validationErrors };
    }

    private validateEnoughSheets(dataHeader: HeaderSheetType[], canAdminCompletesProfile: boolean): void {
        let sheetNames = dataHeader.map((item) => item.sheetName);
        const requiredSheets = canAdminCompletesProfile
            ? SHEET_IMPORT_FACILITY_GROUP_SAQ_NAMES
            : SHEET_IMPORT_SAQ_NAMES;
        for (const sheetName of requiredSheets) {
            if (!sheetNames.includes(sheetName)) {
                throw new BadRequestException({ translate: 'error.worksheet_name_mismatch' });
            }
        }
    }

    private validateEnoughColumnsInEachSheet(
        dataHeader: HeaderSheetType[],
        validationErrors: FileDataValidationType[]
    ): void {
        for (const sheet of dataHeader) {
            let columnNamesToCheck = [];
            switch (sheet.sheetName) {
                case PRODUCT_SHEET_NAME:
                case COMMUNITY_SHEET_NAME:
                case LABOR_SHEET_NAME:
                    columnNamesToCheck = GROUP_QUESTION_COLUMN_NAMES;
                    break;
            }

            for (const columnName of columnNamesToCheck) {
                if (!sheet.headers.includes(columnName)) {
                    validationErrors.push({
                        index: 1,
                        errors: [
                            {
                                key: columnName,
                                error: trans('error.file_structure_altered'),
                                currentValue: null,
                                isBlankRow: false
                            }
                        ],
                        isShowRow: true,
                        sheet: sheet.sheetName
                    });
                }
            }
        }
    }

    private async validateDataInEachSheet(
        dataImport: ExcelToJsonResultType[],
        validationErrors: FileDataValidationType[]
    ): Promise<number> {
        let validatedItemCount = 0;

        for (const sheet of dataImport) {
            switch (sheet.sheetName) {
                case PRODUCT_SHEET_NAME:
                case COMMUNITY_SHEET_NAME:
                case LABOR_SHEET_NAME:
                    const { validatedItemCount: validNumber } = await this.validateGroupQuestion(
                        sheet,
                        validationErrors
                    );
                    validatedItemCount += validNumber;

                    break;
            }
        }

        return validatedItemCount;
    }

    async validateGroupQuestion(
        sheet: ExcelToJsonResultType,
        validationErrors: FileDataValidationType[]
    ): Promise<ValidateImportType> {
        const sheetData: RowDataType[] = sheet.sheetData;
        let numberValid = 0;
        let indexColumn = 0;
        const mappedIndex = sheetData.map((item) => Number(item.Index));

        for (let index = 0; index < sheetData.length; index++) {
            const row = this.importGroupQuestionService.convertRow(sheetData[index]);
            const errors: FileValidationError[] = [];
            indexColumn = this.validateQuestion(row, errors, indexColumn);
            this.validateConditionalQuestion(row, errors);
            this.validateResponseType(row, errors);
            this.validateResponseOption(row, errors);
            this.validateGoTo(row, errors, uniq(mappedIndex));

            if (trimValue(row.indicator)) {
                await this.validateIndicatorAndSubIndicator(row, errors);
            }
            if (trimValue(row.riskLevel)) {
                this.validateRiskLevel(row, errors);
            }
            if (errors.length) {
                validationErrors.push({
                    index: index + 2,
                    errors,
                    isShowRow: true,
                    sheet: sheet.sheetName
                });
            } else {
                numberValid++;
            }
        }
        return { validatedItemCount: numberValid, validationErrors };
    }

    private validateQuestion(row: RowDataType, errors: FileValidationError[], indexColumn: number): number {
        if (isEmpty(row.question) && indexColumn !== row.index) {
            errors.push({
                key: 'Question',
                error: trans('validation.product_attribute_is_required', { args: { attributeName: 'Question' } }),
                currentValue: row.question,
                isBlankRow: isEmpty(row.question)
            });
        }
        return row.index;
    }

    private validateResponseOption(row: RowDataType, errors: FileValidationError[]): void {
        if (
            isEmpty(row.responseOptions) &&
            ![TOTAL_NUMBER_MALE_WORKER, TOTAL_NUMBER_FEMALE_WORKER].includes(row.question)
        ) {
            errors.push({
                key: 'Response Option',
                error: trans('validation.product_attribute_is_required', {
                    args: { attributeName: 'Response Option' }
                }),
                currentValue: row.responseOptions,
                isBlankRow: isEmpty(row.responseOptions)
            });
        }
    }

    private validateConditionalQuestion(row: RowDataType, errors: FileValidationError[]): void {
        if (!['Y', 'N'].includes(row.conditionalQuestion)) {
            errors.push({
                key: 'Conditional question',
                error: trans('validation.conditional_question_must_be_y_or_n'),
                currentValue: row.conditionalQuestion,
                isBlankRow: isEmpty(row.conditionalQuestion)
            });
        }
        if (row.conditionalQuestion === 'Y' && isEmpty(row.goTo)) {
            errors.push({
                key: 'Conditional question',
                error: trans('validation.routing_missing_go_to'),
                currentValue: row.conditionalQuestion,
                isBlankRow: isEmpty(row.conditionalQuestion)
            });
        }
    }

    private validateResponseType(row: RowDataType, errors: FileValidationError[]): void {
        if (!RESPONSE_TYPES.includes(row.responseType)) {
            errors.push({
                key: 'Response Type',
                error: trans('validation.response_type_must_be_multi_select_boolean_single_select_integer'),
                currentValue: row.responseType,
                isBlankRow: isEmpty(row.responseType)
            });
        }
    }

    private validateGoTo(row: RowDataType, errors: FileValidationError[], mappedIndex: number[]): void {
        if (row.conditionalQuestion === 'Y' && row.goTo && row.goTo !== 'End') {
            if (isNaN(Number(row.goTo))) {
                errors.push({
                    key: 'Go to',
                    error: trans('validation.go_to_must_be_a_number_or_end'),
                    currentValue: row.goTo,
                    isBlankRow: isEmpty(row.goTo)
                });
            } else if (!mappedIndex.includes(Number(row.goTo))) {
                errors.push({
                    key: 'Go to',
                    error: trans('validation.incorrect_routing_go_to'),
                    currentValue: row.goTo,
                    isBlankRow: isEmpty(row.goTo)
                });
            }
        }
    }

    private async validateIndicatorAndSubIndicator(row: RowDataType, errors: FileValidationError[]): Promise<void> {
        const indicatorId = await this.importGroupQuestionService.getIndicatorId(trimValue(row.indicator));
        if (!indicatorId) {
            errors.push({
                key: 'Indicator',
                error: trans('validation.indicator_is_not_valid'),
                currentValue: row.indicator,
                isBlankRow: isEmpty(row.indicator)
            });
        }
        if (trimValue(row.subIndicator)) {
            const subIndicatorId = await this.importGroupQuestionService.getSubIndicatorId(
                indicatorId,
                trimValue(row.subIndicator)
            );
            if (!subIndicatorId) {
                errors.push({
                    key: 'Sub indicator',
                    error: trans('validation.sub_indicator_is_not_valid'),
                    currentValue: row.subIndicator,
                    isBlankRow: isEmpty(row.subIndicator)
                });
            }
        }
    }

    private validateRiskLevel(row: RowDataType, errors: FileValidationError[]): void {
        const riskLevel = this.importGroupQuestionService.getRiskLevel(row.riskLevel);
        if (isNil(riskLevel)) {
            errors.push({
                key: 'Risk category/weight',
                error: trans('validation.risk_category_weight_is_not_valid'),
                currentValue: row.riskLevel,
                isBlankRow: isEmpty(row.riskLevel)
            });
        }
    }
}
