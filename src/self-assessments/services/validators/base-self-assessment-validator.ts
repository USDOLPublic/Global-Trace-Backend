import { AnswerValueDto } from '~self-assessments/http/dto/answer-assessment.dto';
import { DEFAULT_LANGUAGE } from '~core/constants/default-language.constant';
import { I18nFieldMetadataType } from '~self-assessments/types/i18n-field-metadata.type';
import { AssessmentValidateAnswerException } from '~self-assessments/exceptions/assessment-validate-answer.exception';
import { standardizeJoiErrorMessage } from '~files/helpers/add-error-validation.helper';
import Joi from 'joi';
import { SaqAnswerSchemaObject } from '~self-assessments/types/saq-answer-schema-object.type';
import { ValidateAnswerParams } from '~self-assessments/types/validate-answer-params.type';

export abstract class BaseSelfAssessmentValidator {
    private extractAnswerValue(answer: I18nFieldMetadataType): I18nFieldMetadataType {
        return answer[DEFAULT_LANGUAGE] ? answer[DEFAULT_LANGUAGE] : answer;
    }

    protected getAnswerData(answerValue: AnswerValueDto): AnswerValueDto {
        return {
            ...answerValue,
            value: this.extractAnswerValue(answerValue.value)
        };
    }

    getRiskScoreValidationSchemaObject({
        traceabilityRiskLevel = '',
        laborRiskLevel = '',
        laborRiskType = ''
    }): Pick<SaqAnswerSchemaObject, 'traceabilityRiskLevel' | 'laborRiskLevel' | 'laborRiskType'> {
        const schema = {
            /* eslint-disable @typescript-eslint/naming-convention */
            traceabilityRiskLevel: Joi.string().equal(traceabilityRiskLevel).messages({
                'any.only': 'Invalid Traceability Risk Level',
                'any.base': 'Invalid Traceability Risk Level'
            }),
            laborRiskLevel: Joi.string().equal(laborRiskLevel).messages({
                'any.only': 'Invalid Labor Risk Level',
                'any.base': 'Invalid Labor Risk Level'
            }),
            laborRiskType: Joi.string().equal(laborRiskType).messages({
                'any.only': 'Invalid Labor Risk Type',
                'any.base': 'Invalid Labor Risk Type'
            })
            /* eslint-enable @typescript-eslint/naming-convention */
        };

        if (traceabilityRiskLevel) {
            schema.traceabilityRiskLevel = schema.traceabilityRiskLevel.required();
        }

        if (laborRiskLevel) {
            schema.laborRiskLevel = schema.laborRiskLevel.required();
        }

        if (laborRiskType) {
            schema.laborRiskType = schema.laborRiskType.required();
        }

        return schema;
    }

    validateAnswer({ schema, answer, questionId, answerIndex }: ValidateAnswerParams) {
        const { error } = schema.validate(answer, { abortEarly: true });
        if (error) {
            throw new AssessmentValidateAnswerException(
                questionId,
                {
                    translate: standardizeJoiErrorMessage(error.details[0].message)
                },
                { itemId: questionId, answerIndex }
            );
        }
    }
}
