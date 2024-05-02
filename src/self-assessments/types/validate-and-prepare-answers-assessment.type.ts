import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { ValidationError } from './answer-validation-error.type';

export type ValidateAndPrepareAnswersAssessment = {
    validationErrors: ValidationError[];
    preparedAnswers: Partial<SelfAssessmentAnswerEntity>[];
};
