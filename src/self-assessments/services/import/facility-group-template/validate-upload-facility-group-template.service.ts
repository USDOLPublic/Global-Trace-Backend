import { BadRequestException, Injectable } from '@nestjs/common';
import { FileDataValidationType } from '~files/types/file-data-validation.type';
import { HeaderSheetType } from '~self-assessments/types/header-sheet.type';
import {
    COMMUNITY_LEVEL_SHEET_NAME,
    FARM_LEVEL_RISK_ASSESSMENT_COLUMN_NAMES,
    FARM_LEVEL_SHEET_NAME,
    SHEET_UPLOAD_FACILITY_GROUP_TEMPLATE_NAMES
} from '~self-assessments/constants/upload-facility-group-template.constant';
import { trans } from '@diginexhk/nestjs-cls-translation';
import { GetDataExcelService } from '~self-assessments/services/import/get-data-excel.service';
import { ValidateImportType } from '~self-assessments/types/validate-import.type';
import {
    COMMUNITY_SHEET_NAME,
    LABOR_SHEET_NAME,
    SHEET_IMPORT_FACILITY_GROUP_SAQ_NAMES
} from '~self-assessments/constants/import-saq.constant';
import { ExcelToJsonResultType } from '~self-assessments/types/excel-to-json-result.type';
import { RowGroupQuestionDataType } from '~self-assessments/types/row-group-question-data.type';
import { ImportGroupQuestionService } from '~self-assessments/services/import/saq/import-group-question.service';
import { findUniqueItems } from '~core/helpers/array.helper';
import { trim } from 'lodash';

@Injectable()
export class ValidateUploadFacilityGroupTemplateService {
    constructor(
        private getDataExcelService: GetDataExcelService,
        private importGroupQuestionService: ImportGroupQuestionService
    ) {}

    async validate(fileFgt: Express.Multer.File, fileSaq: Express.Multer.File): Promise<ValidateImportType> {
        const fgtHeaders = await this.getDataExcelService.getHeaderRowsFromFile(fileFgt);
        const validationErrors: FileDataValidationType[] = [];

        this.validateEnoughSheets(fgtHeaders, validationErrors);
        if (validationErrors.length) {
            return { validatedItemCount: 0, validationErrors };
        }

        this.validateEnoughColumnsInEachSheet(fgtHeaders, validationErrors);
        if (validationErrors.length) {
            return { validatedItemCount: 0, validationErrors };
        }

        const dataSaq = await this.getDataExcelService.getDataFromFile(fileSaq);
        await this.validateTwoFiles(dataSaq, fgtHeaders, validationErrors);

        return { validatedItemCount: 0, validationErrors };
    }

    private validateEnoughSheets(dataHeader: HeaderSheetType[], validationErrors: FileDataValidationType[]): void {
        let sheetNames = dataHeader.map((item) => item.sheetName);
        for (const sheetName of SHEET_UPLOAD_FACILITY_GROUP_TEMPLATE_NAMES) {
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
            if (sheet.sheetName === FARM_LEVEL_SHEET_NAME) {
                columnNamesToCheck = FARM_LEVEL_RISK_ASSESSMENT_COLUMN_NAMES;
            }

            for (const columnName of columnNamesToCheck) {
                if (!sheet.headers.includes(columnName)) {
                    validationErrors.push({
                        index: 0,
                        errors: [
                            {
                                key: columnName,
                                error: trans('error.file_structure_altered'),
                                currentValue: null,
                                isBlankRow: false
                            }
                        ],
                        isShowRow: false,
                        sheet: sheet.sheetName
                    });
                }
            }
        }
    }

    private getFgtQuestions(fgtHeaders: HeaderSheetType[]): { communityQuestions: string[]; farmQuestions: string[] } {
        const communityColumns =
            fgtHeaders.find((item) => item.sheetName === COMMUNITY_LEVEL_SHEET_NAME)?.headers || [];
        const farmColumns = fgtHeaders.find((item) => item.sheetName === FARM_LEVEL_SHEET_NAME)?.headers || [];
        return {
            communityQuestions: communityColumns.slice(1).map(trim),
            farmQuestions: farmColumns.slice(FARM_LEVEL_RISK_ASSESSMENT_COLUMN_NAMES.length + 1).map(trim)
        };
    }

    private async getSaqQuestions(
        dataSaq: ExcelToJsonResultType[]
    ): Promise<{ communityDefinedQuestions: string[]; laborQuestions: string[] }> {
        let communityDefinedQuestions: string[] = [];
        let laborQuestions: string[] = [];

        for (const sheet of dataSaq) {
            if (SHEET_IMPORT_FACILITY_GROUP_SAQ_NAMES.includes(sheet.sheetName)) {
                let listQuestions: RowGroupQuestionDataType[] = [];
                for (const row of sheet.sheetData) {
                    if (!row.Question) continue;
                    listQuestions = this.importGroupQuestionService.convertQuestion(row, listQuestions);
                }
                const questions = listQuestions.map((item) => item.question);
                if (sheet.sheetName === COMMUNITY_SHEET_NAME) {
                    communityDefinedQuestions = questions;
                } else if (sheet.sheetName === LABOR_SHEET_NAME) {
                    laborQuestions = questions;
                }
            }
        }

        return { communityDefinedQuestions, laborQuestions };
    }

    private async validateTwoFiles(
        dataSaq: ExcelToJsonResultType[],
        fgtHeaders: HeaderSheetType[],
        validationErrors: FileDataValidationType[]
    ): Promise<void> {
        const { communityDefinedQuestions, laborQuestions } = await this.getSaqQuestions(dataSaq);
        const { communityQuestions, farmQuestions } = this.getFgtQuestions(fgtHeaders);

        const [community, product] = findUniqueItems(communityQuestions, communityDefinedQuestions);
        const [labor, farm] = findUniqueItems(farmQuestions, laborQuestions);

        for (const columnName of product) {
            this.addMissingValidationErrors(validationErrors, columnName, COMMUNITY_LEVEL_SHEET_NAME);
        }

        for (const columnName of farm) {
            this.addMissingValidationErrors(validationErrors, columnName, FARM_LEVEL_SHEET_NAME);
        }

        for (const columnName of community) {
            this.addRedundantValidationErrors(validationErrors, columnName, COMMUNITY_LEVEL_SHEET_NAME);
        }

        for (const columnName of labor) {
            this.addRedundantValidationErrors(validationErrors, columnName, FARM_LEVEL_SHEET_NAME);
        }
    }

    private addRedundantValidationErrors(
        validationErrors: FileDataValidationType[],
        columnName: string,
        sheetName: string
    ): void {
        validationErrors.push({
            index: 1,
            errors: [
                {
                    key: columnName,
                    error: trans(`validation.import_column_redundant_compared_to_saq_file`),
                    currentValue: null,
                    isBlankRow: false,
                    isShowKey: true
                }
            ],
            isShowRow: false,
            sheet: sheetName
        });
    }

    private addMissingValidationErrors(
        validationErrors: FileDataValidationType[],
        columnName: string,
        sheetName: string
    ): void {
        validationErrors.push({
            index: 1,
            errors: [
                {
                    key: columnName,
                    error: trans('error.file_structure_altered'),
                    currentValue: null,
                    isBlankRow: false,
                    isShowKey: true
                }
            ],
            isShowRow: false,
            sheet: sheetName
        });
    }
}
