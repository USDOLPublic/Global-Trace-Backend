import { trans } from '@diginexhk/nestjs-cls-translation';
import { StorageService, generateUniqueName } from '@diginexhk/nestjs-storage';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CellValue, Row, Workbook, Worksheet } from 'exceljs';
import Joi from 'joi';
import { cloneDeep } from 'lodash';
import { Readable } from 'stream';
import {
    SHEET_1,
    SHEET_1_HEADER_KEYS,
    SHEET_1_TEMPLATE_HEADERS
} from '~export-templates/constants/supplier-template.constants';
import { TemplateInterface } from '~export-templates/interfaces/template.interface';
import { FacilityService } from '~facilities/services/facility.service';
import { FileEntity } from '~files/entities/file.entity';
import { ErrorTypeEnum } from '~files/enums/error-type.enum';
import { addErrorValidation } from '~files/helpers/add-error-validation.helper';
import { initWorkbook } from '~files/helpers/file.helper';
import { checkIfBlankRow } from '~files/helpers/is-blank-row.helper';
import { FileRepository } from '~files/repositories/file.repository';
import { CheckExistedFacilityResult } from '~files/types/check-existed-facility-result.type';
import { FileDataValidationType } from '~files/types/file-data-validation.type';
import { ImportingSupplierResultType } from '~files/types/importing-supplier-result.type';
import { RowValidationResultType } from '~files/types/row-validation-result.type';
import { SupplierValidationParams } from '~files/types/supplier-validation-params.type';
import { WorkBookInitialization } from '~files/types/work-book-initialization.type';
import { RoleService } from '~role-permissions/services/role.service';

@Injectable()
export class FileService extends TransactionService {
    constructor(
        private fileRepo: FileRepository,
        private storageService: StorageService,
        private facilityService: FacilityService,
        private roleService: RoleService
    ) {
        super();
    }

    /* eslint-disable @typescript-eslint/naming-convention */
    // eslint-disable-next-line max-lines-per-function
    schema(roleNames: string[]) {
        return Joi.object({
            businessName: Joi.string()
                .required()
                .messages({
                    'string.base': trans('import.invalid_business_name'),
                    'string.empty': trans('import.require_business_name')
                }),
            businessRegisterNumber: Joi.optional().allow(null).allow(''),
            oarId: Joi.optional().allow(null).allow(''),
            firstName: Joi.string()
                .required()
                .messages({
                    'string.base': trans('import.invalid_first_name'),
                    'string.empty': trans('import.require_first_name')
                }),
            lastName: Joi.string()
                .required()
                .messages({
                    'string.base': trans('import.invalid_last_name'),
                    'string.empty': trans('import.require_last_name')
                }),
            email: Joi.string()
                .email()
                .required()
                .messages({
                    'string.email': trans('import.invalid_email'),
                    'string.base': trans('import.invalid_email'),
                    'string.empty': trans('import.require_email')
                }),
            type: Joi.string()
                .valid(...roleNames)
                .messages({
                    'any.only': trans('import.invalid_facility_type'),
                    'string.base': trans('import.invalid_facility_type'),
                    'any.invalid': trans('import.facility_type_must_be_left_blank'),
                    'string.empty': trans('import.require_facility_type')
                }),
            isBlankRow: Joi.boolean()
        });
    }
    /* eslint-enable @typescript-eslint/naming-convention */

    private extractRowData(row: Row): TemplateInterface<CellValue> {
        return {
            businessName: row.getCell(SHEET_1_HEADER_KEYS.BUSINESS_NAME).toString(),
            businessRegisterNumber: row.getCell(SHEET_1_HEADER_KEYS.BUSINESS_REGISTER_NUMBER).toString(),
            oarId: row.getCell(SHEET_1_HEADER_KEYS.OS_ID).toString(),
            firstName: row.getCell(SHEET_1_HEADER_KEYS.FIRST_NAME).toString(),
            lastName: row.getCell(SHEET_1_HEADER_KEYS.LAST_NAME).toString(),
            email:
                row.getCell(SHEET_1_HEADER_KEYS.EMAIL).hyperlink?.replace('mailto:', '') ||
                row.getCell(SHEET_1_HEADER_KEYS.EMAIL).toString(),
            type: row.getCell(SHEET_1_HEADER_KEYS.TYPE).toString(),
            isBlankRow: checkIfBlankRow(row, SHEET_1_TEMPLATE_HEADERS)
        };
    }

    private setIsValidatedRowData(worksheet: Worksheet, rowIndex: number): void {
        worksheet.getRow(rowIndex).getCell(SHEET_1_HEADER_KEYS.IS_VALIDATED).value = true;
    }

    extractFileData(worksheet: Worksheet, isTakeValidatedData: boolean = false) {
        const reportData: TemplateInterface<CellValue>[] = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            const isValidated = isTakeValidatedData
                ? worksheet.getRow(rowNumber).getCell(SHEET_1_HEADER_KEYS.IS_VALIDATED)?.toString() === 'true'
                : true;

            if (rowNumber > 1 && isValidated) {
                reportData.push(this.extractRowData(row));
            }
        });
        return reportData;
    }

    private async validate(
        fileTemplateData: TemplateInterface<CellValue>[],
        worksheet: Worksheet
    ): Promise<RowValidationResultType> {
        const roleNames = await this.roleService.getSupplierRoleNames();
        const errors: FileDataValidationType[] = [];
        let validatedItemCount = 0;

        for (const [rowIndex, supplier] of Object.entries(fileTemplateData)) {
            let currentRowIndex = +rowIndex + 2;
            const schema = this.schema(roleNames);
            const { error } = schema.validate(supplier, { abortEarly: false });
            const { existedFacilityEmail, existedFacilityOarId, existedFacility } = await this.getExistedFacilities(
                supplier
            );
            const isDuplicatedEmailInTemplateFile = !!fileTemplateData.find(
                (row, index) => row.email === supplier.email && index < +rowIndex
            );
            validatedItemCount = this.validateItems({
                error,
                errors,
                currentRowIndex,
                isDuplicatedEmailInTemplateFile,
                supplier,
                existedFacilityEmail,
                existedFacilityOarId,
                existedFacility,
                validatedItemCount,
                worksheet,
                rowIndex: +rowIndex,
                isBlankRow: supplier.isBlankRow
            });
        }
        const totalItems = fileTemplateData.filter(({ isBlankRow }) => !isBlankRow).length;
        return { totalItems, validatedItemCount, validationErrors: errors };
    }

    // eslint-disable-next-line max-lines-per-function
    private validateItems({
        error,
        errors,
        currentRowIndex,
        isDuplicatedEmailInTemplateFile,
        supplier,
        existedFacilityEmail,
        existedFacilityOarId,
        existedFacility,
        validatedItemCount,
        worksheet,
        rowIndex,
        isBlankRow
    }: SupplierValidationParams) {
        if (error) {
            addErrorValidation({
                currentListErrors: errors,
                errors: error.details,
                errorType: ErrorTypeEnum.JOI,
                currentRowIndex,
                isBlankRow
            });
        } else if (isDuplicatedEmailInTemplateFile) {
            addErrorValidation({
                currentListErrors: errors,
                errorType: ErrorTypeEnum.DUPLICATED_EMAIL_IN_FILE_TEMPLATE,
                currentRowIndex,
                currentValue: supplier.email as string,
                isBlankRow
            });
        } else if (existedFacilityEmail) {
            addErrorValidation({
                currentListErrors: errors,
                errorType: ErrorTypeEnum.EXISTED_FACILITY_EMAIL_IN_DATABASE,
                currentRowIndex,
                currentValue: supplier.email as string,
                isBlankRow
            });
        } else if (existedFacilityOarId) {
            addErrorValidation({
                currentListErrors: errors,
                errorType: ErrorTypeEnum.EXISTED_FACILITY_OARID_IN_DATABASE,
                currentRowIndex,
                currentValue: supplier.oarId as string,
                isBlankRow
            });
        } else if (existedFacility) {
            addErrorValidation({
                currentListErrors: errors,
                errorType: ErrorTypeEnum.EXISTED_FACILITY_IN_DATABASE,
                currentRowIndex,
                currentValue: supplier.oarId as string,
                isBlankRow
            });
        } else {
            validatedItemCount++;
            this.setIsValidatedRowData(worksheet, rowIndex + 2);
        }

        return validatedItemCount;
    }

    private async getExistedFacilities(supplier: TemplateInterface<CellValue>): Promise<CheckExistedFacilityResult> {
        const [existedFacilityEmail, existedFacilityOarId, existedFacility] = await Promise.all([
            this.facilityService.findSupplierFacilityByContactorEmail(
                supplier.businessName as string,
                supplier.email as string
            ),
            this.facilityService.findSupplierFacilityByContactorOarId(
                supplier.businessName as string,
                supplier.oarId as string
            ),
            this.facilityService.findExistedSupplierFacility(
                supplier.businessName as string,
                supplier.email as string,
                supplier.oarId as string
            )
        ]);

        return { existedFacilityEmail, existedFacilityOarId, existedFacility };
    }

    private async uploadFile(file: Express.Multer.File, workbook: Workbook): Promise<FileEntity> {
        let blobClient;

        if (file.mimetype === 'text/csv') {
            const buffer = await workbook.csv.writeBuffer();
            const stream = Readable.from(buffer.toString());
            blobClient = await this.storageService.uploadStream(stream, generateUniqueName(file.originalname));
        } else {
            const buffer = await workbook.xlsx.writeBuffer();
            blobClient = await this.storageService.uploadFile({
                file: buffer as Buffer,
                fileName: generateUniqueName(file.originalname)
            });
        }

        return this.fileRepo.createOne({ blobName: blobClient.blobName });
    }

    private async initWorkbook(
        fileOrStream: Express.Multer.File | NodeJS.ReadableStream
    ): Promise<WorkBookInitialization> {
        const workbook = await initWorkbook(fileOrStream);
        const worksheet = workbook.getWorksheet(SHEET_1);
        if (!worksheet) {
            throw new BadRequestException({ translate: 'error.worksheet_name_mismatch' });
        }

        worksheet.columns = cloneDeep(SHEET_1_TEMPLATE_HEADERS);

        return { workbook, worksheet };
    }

    async uploadAndValidateTemplate(file: Express.Multer.File): Promise<ImportingSupplierResultType> {
        const { workbook, worksheet } = await this.initWorkbook(file);

        const data = this.extractFileData(worksheet);
        const { totalItems, validatedItemCount, validationErrors } = await this.validate(data, worksheet);
        const uploadedFile = await this.uploadFile(file, workbook);

        return { fileId: uploadedFile.id, totalItems, validatedItemCount, validationErrors };
    }

    async readFileById(id: string): Promise<WorkBookInitialization> {
        const stream = await this.getFileById(id);

        return this.initWorkbook(stream);
    }

    createOne(blobName: string): Promise<FileEntity> {
        return this.fileRepo.createOne({ blobName });
    }

    async getFileById(id: string): Promise<NodeJS.ReadableStream> {
        const file = await this.fileRepo.findOneByOrFail({ id });
        return this.storageService.getFileStream(file.blobName);
    }
}
