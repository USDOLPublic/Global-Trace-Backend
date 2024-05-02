import { ExtractAnswerValidationData } from '~self-assessments/types/extract-answer-validation-data';
import * as Joi from 'joi';
import { AnswerValueDto } from '~self-assessments/http/dto/answer-assessment.dto';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { FreeInputMetadataType } from '~self-assessments/types/saq-metadata.type';
import { FreeInputValueMetadata } from '~self-assessments/saq-extra-types/free-input-value-metadata';
import { SaqAnswerSchemaObject } from '~self-assessments/types/saq-answer-schema-object.type';
import { ExtractValidationDataParams } from '~self-assessments/types/extract-validation-data-params.type';

export interface SelfAssessmentValidatorInterface {
    getSchema: (
        params: ExtractAnswerValidationData | FreeInputValueMetadata
    ) => Joi.ObjectSchema<SaqAnswerSchemaObject>;
    validateAnswers: (question: SelfAssessmentQuestionEntity, answerValues: AnswerValueDto[]) => void;
    extractAnswerValidationData: (
        params: ExtractValidationDataParams
    ) => ExtractAnswerValidationData | FreeInputMetadataType;
}
