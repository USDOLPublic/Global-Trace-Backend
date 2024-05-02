import { TransactionService } from '@diginexhk/nestjs-transaction';
import { Injectable } from '@nestjs/common';
import {
    ImportingFarmGroupResultType,
    ImportingFarmLevelRiskResultType
} from '~facilities/types/facility-groups/importing-farm-group-result.type';
import { flatMap, map, omit, sortBy } from 'lodash';
import { FarmLevelRiskExcelData } from '~facilities/types/facility-groups/xlsx-farm-level-risk-data.type';
import { FileEntity } from '~files/entities/file.entity';
import { FileService } from '~files/services/file.service';
import { StorageService } from '@diginexhk/nestjs-storage';
import { FileDataValidationType, FileValidationError } from '~files/types/file-data-validation.type';
import { addErrorValidation } from '~files/helpers/add-error-validation.helper';
import { ErrorTypeEnum } from '~files/enums/error-type.enum';
import { SHEET_1, SHEET_2, SHEET_3 } from '~facilities/constants/farm-group-template.constants';
import { CoordinateType } from '~facilities/types/coordinates.type';
import { isLatLong } from '~core/helpers/is-lat-long.hepler';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { SelfAssessmentGroupService } from '~self-assessments/services/self-assessment-group.service';
import { FacilityGroupExcelService } from '~facilities/services/import/facility-group-excel.service';
import { ValidExcelQuestionData } from '~facilities/types/facility-groups/valid-excel-question-data.type';
import { ValidateImportTemplateUtilService } from './validate-import-template-util.service';
import { SelfAssessmentGroupEntity } from '~self-assessments/entities/self-assessment-group.entity';
import { InstructionExcelType } from '~facilities/types/facility-groups/instruction-excel.type';
import { FacilityGroupService } from '../facility-group.service';
import { trans } from '@diginexhk/nestjs-cls-translation';
import { ValidationErrorItem } from 'joi';
import { capitalizeFirstWord } from '~core/helpers/string.helper';

@Injectable()
export class ValidateFacilityGroupService extends TransactionService {
    constructor(
        private fileService: FileService,
        private facilityGroupExcelService: FacilityGroupExcelService,
        private storageService: StorageService,
        private selfAssessmentGroupService: SelfAssessmentGroupService,
        private validateImportTemplateUtilService: ValidateImportTemplateUtilService,
        private facilityGroupService: FacilityGroupService
    ) {
        super();
    }

    async uploadAndValidateTemplate(
        file: Express.Multer.File,
        roleId: string,
        facilityGroupId?: string,
        isUpdating: boolean = false
    ): Promise<ImportingFarmGroupResultType> {
        await this.facilityGroupService.validRoleCompleteProfile(roleId);
        const groups = await this.selfAssessmentGroupService.getSelfAssessmentGroupByRoleId(roleId);
        const { instruction, farmLevelRisk, communityRisk } = await this.facilityGroupExcelService.parseXlsx({
            file,
            groups,
            isParsingForUpdate: isUpdating,
            includeEmpty: true
        });
        const { instructionTotalItems, validatedInstructionCount, validationInstructionErrors } =
            await this.validateInstruction(instruction, facilityGroupId, isUpdating);
        const { communityRiskTotalItems, validationCommunityRiskErrors, validatedCommunityRiskItemCount } =
            this.validateCommunityRisk(communityRisk as ValidExcelQuestionData);
        const { farmLevelRiskTotalItems, validationFarmLevelRiskErrors, validatedFarmLevelRiskItemCount } =
            this.validateFarmLevelRisk(farmLevelRisk as FarmLevelRiskExcelData[]);
        let fileId: string;

        if (!validationCommunityRiskErrors.length) {
            await this.validateCompleteSaq(
                farmLevelRisk as FarmLevelRiskExcelData[],
                groups,
                validationFarmLevelRiskErrors
            );
        }
        if (
            !this.hasExcelErrors(
                validationInstructionErrors,
                validationFarmLevelRiskErrors,
                validationCommunityRiskErrors
            )
        ) {
            fileId = (await this.uploadFile(file)).id;
        }

        return {
            fileId,
            totalItems: farmLevelRiskTotalItems + communityRiskTotalItems + instructionTotalItems,
            validatedItemCount:
                validatedFarmLevelRiskItemCount + validatedCommunityRiskItemCount + validatedInstructionCount,
            validationErrors: sortBy(
                [...validationInstructionErrors, ...validationCommunityRiskErrors, ...validationFarmLevelRiskErrors],
                ['index']
            )
        };
    }

    private hasExcelErrors(
        validationInstructionErrors: FileDataValidationType[],
        validationFarmLevelRiskErrors: FileDataValidationType[],
        validationCommunityRiskErrors: FileDataValidationType[]
    ): boolean {
        for (const validError of validationInstructionErrors) {
            if (validError.errors.length) {
                return true;
            }
        }

        for (const validError of validationFarmLevelRiskErrors) {
            if (validError.errors.length) {
                return true;
            }
        }

        for (const validError of validationCommunityRiskErrors) {
            if (validError.errors.length) {
                return true;
            }
        }

        return false;
    }

    async validateCompleteSaq(
        farmLevelRisk: FarmLevelRiskExcelData[],
        groups: SelfAssessmentGroupEntity[],
        errors: FileDataValidationType[]
    ) {
        const questions = flatMap(groups, 'questions');
        for (let i = 0; i < farmLevelRisk.length; i++) {
            const rowIndex = i + 2;
            const farm = farmLevelRisk[i];
            const isEmptyAnswer = this.checkEmptyAnswer(questions, farm);

            if (isEmptyAnswer) {
                addErrorValidation({
                    currentListErrors: errors,
                    errorType: ErrorTypeEnum.SAQ_HAS_NOT_COMPLETE,
                    currentRowIndex: rowIndex,
                    errors: [],
                    sheet: SHEET_3,
                    isBlankRow: farm.isBlankRow
                });
            }
        }

        return errors;
    }

    async validateInstruction(instruction: InstructionExcelType, facilityGroupId: string, isUpdating: boolean) {
        const errors: FileDataValidationType[] = [
            {
                index: 1,
                errors: [],
                isShowRow: false,
                sheet: SHEET_1
            }
        ];
        const { error } = this.validateImportTemplateUtilService
            .getInstructionSchemaValidation()
            .validate(instruction, { abortEarly: false });
        if (error) {
            addErrorValidation({
                currentListErrors: errors,
                errorType: ErrorTypeEnum.JOI,
                currentRowIndex: 1,
                errors: error.details,
                sheet: SHEET_1
            });
        }
        await this.validateImportTemplateUtilService.validInstructionValue(
            instruction,
            errors,
            facilityGroupId,
            isUpdating
        );

        return {
            instructionTotalItems: 1,
            validatedInstructionCount: errors[0].errors.length ? 0 : 1,
            validationInstructionErrors: errors
        };
    }

    validateCommunityRisk(communityRisk: ValidExcelQuestionData) {
        const errors: FileValidationError[] = [];
        const firstQuestionId = Object.keys(communityRisk)[0];
        this.validateImportTemplateUtilService.validateAnswers(communityRisk, communityRisk[firstQuestionId], errors);

        return {
            communityRiskTotalItems: 1,
            validatedCommunityRiskItemCount: errors.length ? 0 : 1,
            validationCommunityRiskErrors: [
                {
                    index: 2,
                    errors,
                    isShowRow: true,
                    sheet: SHEET_2
                }
            ]
        };
    }

    validateFarmLevelRisk(farms: FarmLevelRiskExcelData[]): ImportingFarmLevelRiskResultType {
        let fileDataValid: FileDataValidationType[] = [];
        let validatedFarmLevelRiskItemCount = 0;
        const farmsLevelRiskOmit = map(farms as FarmLevelRiskExcelData[], (farm: FarmLevelRiskExcelData) =>
            omit(farm, ['selfAssessments'])
        );
        for (let i = 0; i < farmsLevelRiskOmit.length; i++) {
            const farm = farmsLevelRiskOmit[i];
            const rowIndex = farm.rowIndex;
            if (!farm.isBlankRow) {
                const { error } = this.validateImportTemplateUtilService
                    .getFarmLevelRiskSchemaValidation()
                    .validate(omit(farm, 'rowIndex'), { abortEarly: false });
                this.validateFarmIds(fileDataValid, farmsLevelRiskOmit, farm.id, i + 2);
                if (error) {
                    addErrorValidation({
                        currentListErrors: fileDataValid,
                        errorType: ErrorTypeEnum.JOI,
                        currentRowIndex: rowIndex,
                        errors: error.details,
                        sheet: SHEET_3
                    });
                }
            }
            const selfAssessment = farms[i].selfAssessments as ValidExcelQuestionData;
            const validationErrors = this.validSelfAssessments(selfAssessment);
            fileDataValid[i] = {
                index: rowIndex,
                errors: fileDataValid[i]
                    ? [...this.convertFacilityDefaultErrors(fileDataValid[i].errors), ...validationErrors]
                    : validationErrors,
                isShowRow: true,
                sheet: SHEET_3
            };
            if (!fileDataValid[i].errors.length) {
                validatedFarmLevelRiskItemCount++;
            }
        }

        return {
            farmLevelRiskTotalItems: farms.filter(({ isBlankRow }) => !isBlankRow).length,
            validatedFarmLevelRiskItemCount,
            validationFarmLevelRiskErrors: fileDataValid
        };
    }

    private validSelfAssessments(selfAssessment: ValidExcelQuestionData) {
        const validationErrors: FileValidationError[] = [];
        if (Object.values(selfAssessment).length) {
            const firstQuestionId = Object.keys(selfAssessment)[0];
            this.validateImportTemplateUtilService.validateAnswers(
                selfAssessment,
                selfAssessment[firstQuestionId],
                validationErrors
            );
        }

        return validationErrors;
    }

    validateFarmIds(
        errors: FileDataValidationType[],
        farms: FarmLevelRiskExcelData[],
        farmId: string,
        rowIndex: number
    ): boolean {
        let isValidation = true;
        if (Number.isNaN(+farmId)) {
            addErrorValidation({
                currentListErrors: errors,
                errorType: ErrorTypeEnum.INVALID_FARM_ID,
                currentRowIndex: rowIndex,
                sheet: SHEET_3
            });

            isValidation = false;
        }

        const isDuplicatedId = !!farms.find(({ id }, index) => id === farmId && index < rowIndex - 2);
        if (isDuplicatedId) {
            addErrorValidation({
                currentListErrors: errors,
                errorType: ErrorTypeEnum.DUPLICATED_ID_IN_FARM_TEMPLATE,
                currentRowIndex: rowIndex,
                currentValue: farmId,
                sheet: SHEET_3
            });

            isValidation = false;
        }

        return isValidation;
    }

    validateLatLong(
        errors: FileDataValidationType[],
        { latitude, longitude }: CoordinateType,
        rowIndex: number
    ): boolean {
        const latLongPair = `${latitude},${longitude}`;

        if (!isLatLong(latLongPair)) {
            addErrorValidation({
                currentListErrors: errors,
                errorType: ErrorTypeEnum.INVALID_COORDINATE,
                currentRowIndex: rowIndex,
                currentValue: latLongPair,
                sheet: SHEET_3
            });

            return false;
        }

        return true;
    }

    private checkEmptyAnswer(questions: SelfAssessmentQuestionEntity[], farm: FarmLevelRiskExcelData) {
        const values = Object.values(farm.selfAssessments);
        const countNotEmptyValues = values.filter((value) => value).length;
        if (countNotEmptyValues === 1) {
            return false;
        }
        for (const question of questions) {
            const answer = farm.selfAssessments[question.id];
            if (
                question.conditions &&
                question.conditions[0].answer ===
                    farm.selfAssessments[question.conditions[0].questionId]?.toString()?.toLocaleLowerCase() &&
                answer === ''
            ) {
                return true;
            }
            if (!question.conditions && answer === '') {
                return true;
            }
        }
    }

    private async uploadFile(file: Express.Multer.File): Promise<FileEntity> {
        const fileUpload = await this.storageService.uploadFile({ file, fileName: file.originalname });
        return this.fileService.createOne(fileUpload.blobName);
    }

    private validValueLatLong(errors: FileDataValidationType[], areas: CoordinateType[]): void {
        let invalidValue = false;
        for (const [index, area] of areas.entries()) {
            const latLongPair = `${area.latitude},${area.longitude}`;
            if (!invalidValue && !isLatLong(latLongPair)) {
                errors[0].errors.push({
                    key: 'latitude_longitude',
                    currentValue: `${area.latitude}/${area.longitude}`,
                    error: trans('import.invalid_value_latitude_longitude_index', {
                        args: { index: index + 1 }
                    }),
                    isBlankRow: false
                });
            }
        }
    }

    private customValidLatLong(errorDetails: ValidationErrorItem[]): ValidationErrorItem[] {
        for (const [index, err] of errorDetails.entries()) {
            if (err.context.key === 'longitude') {
                errorDetails[index].message = trans('import.require_longitude_index', {
                    args: { index: index + 1 }
                });
            }
            if (err.context.key === 'latitude') {
                errorDetails[index].message = trans('import.require_latitude_index', {
                    args: { index: index + 1 }
                });
            }
        }
        return errorDetails;
    }

    private convertFacilityDefaultErrors(errors: FileValidationError[]) {
        return errors.map((error) => {
            return {
                ...error,
                key: capitalizeFirstWord(error.key),
                isBlankRow: false,
                isShowKey: false
            };
        });
    }
}
