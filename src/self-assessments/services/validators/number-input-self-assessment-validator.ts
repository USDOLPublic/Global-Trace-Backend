import { BaseSelfAssessmentValidator } from '~self-assessments/services/validators/base-self-assessment-validator';
import * as Joi from 'joi';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { AnswerValueDto } from '~self-assessments/http/dto/answer-assessment.dto';
import { SelfAssessmentValidatorInterface } from '~self-assessments/interfaces/self-assessment-validator.interface';
import { FreeInputValueMetadata } from '~self-assessments/saq-extra-types/free-input-value-metadata';
import { SaqAnswerSchemaObject } from '~self-assessments/types/saq-answer-schema-object.type';
import { ExtractValidationDataParams } from '~self-assessments/types/extract-validation-data-params.type';
import { FreeInputMetadataType } from '~self-assessments/types/saq-metadata.type';

export class NumberInputAssessmentValidator
    extends BaseSelfAssessmentValidator
    implements SelfAssessmentValidatorInterface
{
    extractAnswerValidationData({ question, index, answerValue }: ExtractValidationDataParams): FreeInputValueMetadata {
        let metadata;
        if (answerValue.code) {
            metadata = (question.metadata as FreeInputMetadataType).values.find(
                ({ code }) => code === answerValue.code
            );
        } else {
            metadata = question.metadata.values ? question.metadata.values[index] : question.metadata;
        }
        return metadata as FreeInputValueMetadata;
    }

    getSchema({
        code,
        traceabilityRiskLevel,
        laborRiskLevel,
        laborRiskType
    }: FreeInputValueMetadata): Joi.ObjectSchema<SaqAnswerSchemaObject> {
        return Joi.object({
            /* eslint-disable @typescript-eslint/naming-convention */
            code: Joi.equal(code).required().messages({
                'any.only': 'Invalid answer code',
                'any.base': 'Invalid answer code',
                'any.required': 'Answer code is required'
            }),
            value: Joi.number().required().messages({
                'any.only': 'Invalid answer value',
                'any.base': 'Invalid answer value',
                'any.required': 'Answer value is required'
            }),
            /* eslint-enable @typescript-eslint/naming-convention */
            ...this.getRiskScoreValidationSchemaObject({ traceabilityRiskLevel, laborRiskLevel, laborRiskType })
        });
    }

    validateAnswers(question: SelfAssessmentQuestionEntity, answerValues: AnswerValueDto[]): void {
        for (const [index, answerValue] of Object.entries(answerValues || [])) {
            this.validateAnswer({
                schema: this.getSchema(this.extractAnswerValidationData({ question, index: +index, answerValue })),
                answer: this.getAnswerData(answerValue),
                questionId: question.id,
                answerIndex: +index
            });
        }
    }
}
