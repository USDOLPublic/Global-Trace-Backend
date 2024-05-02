import { CellValue, Worksheet } from 'exceljs';
import { TemplateInterface } from '~export-templates/interfaces/template.interface';
import { FileDataValidationType } from '~files/types/file-data-validation.type';
import Joi from 'joi';
import { FacilityEntity } from '~facilities/entities/facility.entity';

export type SupplierValidationParams = {
    error?: Joi.ValidationError;
    errors: FileDataValidationType[];
    currentRowIndex: number;
    isDuplicatedEmailInTemplateFile: boolean;
    supplier: TemplateInterface<CellValue>;
    existedFacilityEmail: FacilityEntity;
    existedFacilityOarId: FacilityEntity;
    existedFacility: FacilityEntity;
    validatedItemCount: number;
    worksheet: Worksheet;
    rowIndex: number;
    isBlankRow: boolean;
};
