import * as Joi from 'joi';
import { SelfAssessmentValidatorInterface } from '~self-assessments/interfaces/self-assessment-validator.interface';
import { FreeInputValueMetadata } from '~self-assessments/saq-extra-types/free-input-value-metadata';
import { SaqAnswerSchemaObject } from '~self-assessments/types/saq-answer-schema-object.type';
import { NumberInputAssessmentValidator } from '~self-assessments/services/validators/number-input-self-assessment-validator';

export class TextInputAssessmentValidator
    extends NumberInputAssessmentValidator
    implements SelfAssessmentValidatorInterface
{
    getSchema({
        traceabilityRiskLevel,
        laborRiskLevel,
        laborRiskType
    }: FreeInputValueMetadata): Joi.ObjectSchema<SaqAnswerSchemaObject> {
        return Joi.object({
            /* eslint-disable @typescript-eslint/naming-convention */
            value: Joi.string().required().messages({
                'any.only': 'Invalid answer value',
                'any.base': 'Invalid answer value',
                'any.required': 'Answer value is required'
            }),
            /* eslint-enable @typescript-eslint/naming-convention */
            ...this.getRiskScoreValidationSchemaObject({ traceabilityRiskLevel, laborRiskLevel, laborRiskType })
        });
    }
}
