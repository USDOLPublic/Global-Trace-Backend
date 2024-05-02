import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';
import { TranslationValidationError } from './self-assessment-translation-validation-error.type';
import { QuestionResponseTranslation } from './self-assessment-translations.type';
import { Dictionary } from 'lodash';
import Joi from 'joi';

export type ValidateResponseTranslationParams = {
    questionResponses: QuestionResponseTranslation[];
    mappedExistedQuestionResponses: Dictionary<SelfAssessmentQuestionResponseEntity>;
    errors: TranslationValidationError[];
    preparedQuestionResponseTranslations: Partial<SelfAssessmentQuestionResponseEntity>[];
    error: Joi.ValidationError;
};
