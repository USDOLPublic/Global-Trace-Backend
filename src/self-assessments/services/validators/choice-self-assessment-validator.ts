import { BaseSelfAssessmentValidator } from '~self-assessments/services/validators/base-self-assessment-validator';
import { ExtractAnswerValidationData } from '~self-assessments/types/extract-answer-validation-data';
import * as Joi from 'joi';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { AnswerValueDto } from '~self-assessments/http/dto/answer-assessment.dto';
import { AssessmentValidateAnswerException } from '~self-assessments/exceptions/assessment-validate-answer.exception';
import { SelfAssessmentValidatorInterface } from '~self-assessments/interfaces/self-assessment-validator.interface';
import { isBoolean, omit } from 'lodash';
import { DEFAULT_LANGUAGE } from '~core/constants/default-language.constant';
import { ChoiceMetadataType } from '~self-assessments/types/saq-metadata.type';
import { SaqAnswerSchemaObject } from '~self-assessments/types/saq-answer-schema-object.type';

export class ChoiceSelfAssessmentValidator
    extends BaseSelfAssessmentValidator
    implements SelfAssessmentValidatorInterface
{
    extractAnswerValidationData({ question, answerValue }): ExtractAnswerValidationData {
        const metadata = (question.metadata as ChoiceMetadataType).values.find(({ code }) => code === answerValue.code);

        if (!metadata) {
            throw new AssessmentValidateAnswerException(
                question.id,
                {
                    translate: 'Invalid answer code'
                },
                { itemId: question.id }
            );
        }

        metadata.laborRiskLevel = metadata.laborRiskLevel || answerValue.laborRiskLevel;
        metadata.traceabilityRiskLevel = metadata.traceabilityRiskLevel || answerValue.traceabilityRiskLevel;

        return {
            ...omit(metadata, ['i18n', 'code']),
            validValue: metadata.i18n[DEFAULT_LANGUAGE],
            validCode: metadata.code
        };
    }

    getSchema({
        validCode,
        validValue,
        traceabilityRiskLevel,
        laborRiskLevel,
        laborRiskType
    }: ExtractAnswerValidationData): Joi.ObjectSchema<SaqAnswerSchemaObject> {
        return Joi.object({
            /* eslint-disable @typescript-eslint/naming-convention */
            code: Joi.equal(validCode).required().messages({
                'any.only': 'Invalid answer code',
                'any.base': 'Invalid answer code',
                'any.required': 'Answer code is required'
            }),
            value: Joi.equal(validValue).required().messages({
                'any.only': 'Invalid answer value',
                'any.base': 'Invalid answer value',
                'any.required': 'Answer value is required'
            }),
            /* eslint-enable @typescript-eslint/naming-convention */
            ...this.getRiskScoreValidationSchemaObject({ traceabilityRiskLevel, laborRiskLevel, laborRiskType })
        });
    }

    getSchemaOfAnswerWithOtherOption({
        validCode,
        traceabilityRiskLevel,
        laborRiskLevel,
        laborRiskType
    }: ExtractAnswerValidationData): Joi.ObjectSchema<SaqAnswerSchemaObject> {
        return Joi.object({
            /* eslint-disable @typescript-eslint/naming-convention */
            code: Joi.equal(validCode).required().messages({
                'any.only': 'Invalid answer code',
                'any.base': 'Invalid answer code',
                'any.required': 'Answer code is required'
            }),
            value: Joi.any().required().messages({
                'any.required': 'Answer value is required'
            }),
            /* eslint-enable @typescript-eslint/naming-convention */
            ...this.getRiskScoreValidationSchemaObject({ traceabilityRiskLevel, laborRiskLevel, laborRiskType })
        });
    }

    validateAnswers(question: SelfAssessmentQuestionEntity, answerValues: AnswerValueDto[]): void {
        for (const [index, answerValue] of Object.entries(answerValues || [])) {
            const answerDataValidation = this.extractAnswerValidationData({ question, answerValue });

            this.validateAnswer({
                schema: isBoolean(answerDataValidation.isOther)
                    ? this.getSchemaOfAnswerWithOtherOption(answerDataValidation)
                    : this.getSchema(answerDataValidation),
                answer: this.getAnswerData(answerValue),
                questionId: question.id,
                answerIndex: +index
            });
        }
    }
}
