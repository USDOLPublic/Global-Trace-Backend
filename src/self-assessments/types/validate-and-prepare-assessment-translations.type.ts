import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { SelfAssessmentTranslationValidationError } from './self-assessment-translation-validation-error.type';

export type ValidateAndPrepareAssessmentTranslations = {
    validationErrors: SelfAssessmentTranslationValidationError[];
    preparedQuestionTranslations: Partial<SelfAssessmentQuestionEntity>[];
    preparedQuestionResponseTranslations: Partial<SelfAssessmentQuestionResponseEntity>[];
};
