import { Injectable } from '@nestjs/common';
import { isNil, isNull, keyBy } from 'lodash';
import { trans } from '@diginexhk/nestjs-cls-translation';
import { SelfAssessmentQuestionTypesEnum } from '~self-assessments/enums/self-assessment-question-types.enum.';
import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';
import {
    ExcelQuestionData,
    ValidExcelQuestionData
} from '~facilities/types/facility-groups/valid-excel-question-data.type';
import { FileDataValidationType, FileValidationError } from '~files/types/file-data-validation.type';
import { SelfAssessmentService } from '~self-assessments/services/self-assessment.service';
import Joi from 'joi';
import JoiDate from '@joi/date';
import { FarmCertificationEnum } from '~facilities/enums/farm-certification.enum';
import { getEnumValues } from '~core/helpers/enum.helper';
import { DATE_FORMAT } from '~facilities/constants/farm-group-template.constants';
import { FacilityService } from '../facility.service';
import { InstructionExcelType } from '~facilities/types/facility-groups/instruction-excel.type';
import { LocationService } from '~locations/services/location.service';
import { capitalizeFirstWord } from '~core/helpers/string.helper';

@Injectable()
export class ValidateImportTemplateUtilService {
    constructor(
        private selfAssessmentService: SelfAssessmentService,
        private facilityService: FacilityService,
        private locationService: LocationService
    ) {}

    validateAnswers(
        selfAssessment: ValidExcelQuestionData,
        excelQuestionData: ExcelQuestionData,
        validationErrors: FileValidationError[]
    ) {
        if (!excelQuestionData) {
            return;
        }

        if (excelQuestionData.type === SelfAssessmentQuestionTypesEnum.ONE_CHOICE && excelQuestionData.value === '0') {
            excelQuestionData.value = '0%';
        }

        const questionResponse = this.getValidQuestionResponseAndPrepareAnswers(excelQuestionData, validationErrors);

        return this.validateAnswers(selfAssessment, selfAssessment[questionResponse.nextQuestionId], validationErrors);
    }

    private getValidQuestionResponseAndPrepareAnswers(
        excelQuestionData: ExcelQuestionData,
        validationErrors: FileValidationError[]
    ) {
        const { value, column, type, questionResponses } = excelQuestionData;
        if (type === SelfAssessmentQuestionTypesEnum.NUMBER && isNaN(Number(value))) {
            validationErrors.push({
                key: column,
                currentValue: value,
                error: trans('import.invalid_column_number', {
                    args: { excelColumn: column }
                }),
                isBlankRow: false,
                isShowKey: true
            });
            return this.selfAssessmentService.getQuestionResponseWithRiskLevel(questionResponses);
        }
        const questionResponse = this.getValidQuestionResponse(excelQuestionData);
        if (!questionResponse) {
            validationErrors.push({
                key: column,
                currentValue: value,
                error: trans('validation.invalid_answer_self_assessment'),
                isBlankRow: false,
                isShowKey: true
            });

            return this.selfAssessmentService.getQuestionResponseWithRiskLevel(questionResponses);
        }

        return questionResponse;
    }

    private getValidQuestionResponse(excelQuestion: ExcelQuestionData): SelfAssessmentQuestionResponseEntity {
        const { value, type, questionResponses } = excelQuestion;
        let answerValues = !isNull(value) ? [value] : [];
        if (answerValues.length && type === SelfAssessmentQuestionTypesEnum.MULTI_CHOICE) {
            answerValues = value.split('|');
        }
        if (!answerValues.length || this.isInvalidAnswerValues(answerValues, excelQuestion.type)) {
            return;
        }
        if (
            value &&
            (type === SelfAssessmentQuestionTypesEnum.NUMBER || type === SelfAssessmentQuestionTypesEnum.FREE_TEXT)
        ) {
            return this.selfAssessmentService.getQuestionResponseWithRiskLevel(questionResponses);
        }
        const listQuestionResponses = this.getListValidQuestionResponse(answerValues, excelQuestion);

        return this.selfAssessmentService.getQuestionResponseWithRiskLevel(listQuestionResponses);
    }

    private isInvalidAnswerValues(answerValues: string[], questionType: string): boolean {
        return answerValues.length > 1 && questionType !== SelfAssessmentQuestionTypesEnum.MULTI_CHOICE;
    }

    private getListValidQuestionResponse(
        answerValues: string[],
        excelQuestion: ExcelQuestionData
    ): SelfAssessmentQuestionResponseEntity[] {
        const listValidQuestionResponse = [];
        const mappedQuestionResponses = keyBy(excelQuestion.questionResponses, 'id');

        for (const value of answerValues) {
            const questionResponses = excelQuestion.questionResponses.find(({ option }) => value === option);
            const saqResponseId = questionResponses?.id;
            const questionResponse = mappedQuestionResponses[saqResponseId];
            if (
                !this.selfAssessmentService.isQuestionResponseBelongToQuestion(
                    excelQuestion.questionResponses,
                    saqResponseId
                ) ||
                !this.selfAssessmentService.isValidAnswerBelongToOther(value, mappedQuestionResponses[saqResponseId]) ||
                !this.isValidAnswerWithIntegerAndText(excelQuestion.type, value)
            ) {
                return [];
            }

            listValidQuestionResponse.push(questionResponse);
        }

        return listValidQuestionResponse;
    }

    private isValidAnswerWithIntegerAndText(typeQuestion: SelfAssessmentQuestionTypesEnum, value: string): boolean {
        return !(
            (typeQuestion === SelfAssessmentQuestionTypesEnum.NUMBER ||
                typeQuestion === SelfAssessmentQuestionTypesEnum.FREE_TEXT) &&
            !value
        );
    }

    /* eslint-disable @typescript-eslint/naming-convention */
    // eslint-disable-next-line max-lines-per-function
    getFarmLevelRiskSchemaValidation() {
        return Joi.object({
            id: Joi.string()
                .min(3)
                .max(3)
                .required()
                .messages({
                    'any.base': trans('import.invalid_id'),
                    'string.empty': trans('import.require_id'),
                    'string.min': trans('import.validation_farm_id_length'),
                    'string.max': trans('import.validation_farm_id_length')
                }),
            farmName: Joi.string()
                .required()
                .messages({
                    'any.base': trans('import.invalid_farm_name'),
                    'any.required': trans('import.require_farm_name'),
                    'string.empty': trans('import.require_farm_name')
                }),
            tehsil: Joi.string().optional().allow(null).allow(''),
            businessRegisterNumber: Joi.string().optional().allow(null).allow(''),
            firstNameContactor: Joi.string()
                .required()
                .messages({
                    'any.base': trans('import.invalid_contact_first_name'),
                    'any.required': trans('import.require_contact_first_name'),
                    'string.empty': trans('import.require_contact_first_name')
                }),
            lastNameContactor: Joi.string()
                .required()
                .messages({
                    'any.base': trans('import.invalid_contact_last_name'),
                    'any.required': trans('import.require_contact_last_name'),
                    'string.empty': trans('import.require_contact_last_name')
                }),
            contactPhoneNumber: Joi.string().optional().allow(null).allow(''),
            certification: Joi.string()
                .optional()
                .allow(null)
                .allow('')
                .valid(...getEnumValues(FarmCertificationEnum))
                .messages({
                    'any.only': trans('import.invalid_certification_options'),
                    'any.base': trans('import.invalid_certification')
                }),
            certificationExpiredDate: Joi.extend(JoiDate)
                .date()
                .optional()
                .allow(null)
                .allow('')
                .format(DATE_FORMAT)
                .messages({
                    'date.base': trans('import.date_format_dd_mm_yyyy'),
                    'date.strict': trans('import.date_format_dd_mm_yyyy'),
                    'date.format': trans('import.date_format_dd_mm_yyyy'),
                    'any.base': trans('import.invalid_certification_expiry_date')
                }),
            farmUUID: Joi.string().uuid().optional().allow(null).allow(''),
            createdAt: Joi.number().optional().allow(null).allow(''),
            isBlankRow: Joi.boolean()
        });
    }

    /* eslint-disable @typescript-eslint/naming-convention */
    // eslint-disable-next-line max-lines-per-function
    getInstructionSchemaValidation() {
        return Joi.object({
            farmGroupId: Joi.number()
                .required()
                .min(1000)
                .max(9999)
                .messages({
                    'any.required': trans('import.farm_group_id_unique'),
                    'number.min': trans('import.farm_group_id_min'),
                    'number.max': trans('import.farm_group_id_max')
                }),
            farmGroupName: Joi.string().optional().allow(null).allow(''),
            country: Joi.string()
                .max(255)
                .required()
                .messages({
                    'any.base': trans('import.invalid_country'),
                    'any.required': trans('import.require_country'),
                    'string.empty': trans('import.require_country'),
                    'string.max': trans('import.max_length_country')
                }),
            province: Joi.string()
                .max(255)
                .required()
                .messages({
                    'any.base': trans('import.invalid_province'),
                    'any.required': trans('import.require_province'),
                    'string.max': trans('import.max_length_province')
                }),
            district: Joi.string()
                .max(255)
                .required()
                .messages({
                    'any.base': trans('import.invalid_district'),
                    'any.required': trans('import.require_district'),
                    'string.max': trans('import.max_length_district')
                }),
            areas: Joi.array().allow(null)
        });
    }

    async validInstructionValue(
        instruction: InstructionExcelType,
        errors: FileDataValidationType[],
        facilityGroupId: string,
        isUpdating: boolean
    ): Promise<FileDataValidationType[]> {
        const { farmGroupId, country: countryValue, province: provinceValue, district: districtValue } = instruction;
        const farm = await this.facilityService.findOne({ where: { farmId: farmGroupId } });
        if (farm && !isNil(farmGroupId)) {
            const farmGroupUnique = {
                key: 'farmGroupId',
                error: trans('import.farm_group_id_must_be_unique'),
                isBlankRow: false,
                currentValue: null
            };
            if (!isUpdating) {
                errors[0].errors.push(farmGroupUnique);
            } else {
                const facilityGroup = await this.facilityService.findById(facilityGroupId);
                if (facilityGroup.id !== farm.id && facilityGroup.farmId !== farmGroupId) {
                    errors[0].errors.push(farmGroupUnique);
                }
            }
        }
        const country = await this.locationService.findCountry({ country: countryValue });
        if (!country && !isNil(countryValue)) {
            this.validLocation(errors, 'country');
        }
        const province = await this.locationService.findProvince({
            province: provinceValue,
            countryId: country?.id
        });
        if (!province && !isNil(provinceValue)) {
            this.validLocation(errors, 'province');
        }
        const district = await this.locationService.findDistrict({
            district: districtValue,
            provinceId: province?.id
        });
        if (!district && !isNil(districtValue)) {
            this.validLocation(errors, 'district');
        }
        errors[0].errors = this.convertValidErrors(errors[0].errors);
        return errors;
    }

    private convertValidErrors(errors: FileValidationError[]) {
        return errors.map((error) => {
            return {
                ...error,
                key: capitalizeFirstWord(error.key),
                isBlankRow: false,
                isShowKey: false
            };
        });
    }

    private validLocation(errors: FileDataValidationType[], column: string): void {
        const valueError = { isBlankRow: false, currentValue: null };
        errors[0].errors.push({
            ...valueError,
            key: column,
            error: trans('import.invisible_in_database', {
                args: { column: capitalizeFirstWord(column) }
            })
        });
    }
}
