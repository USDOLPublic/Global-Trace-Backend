import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { ValidationError } from './answer-validation-error.type';
import { I18nField } from './i18n-field.type';
import { AnswerDto } from '~self-assessments/http/dto/answer-self-assessment.dto';

export type ValidateAnswerValueParams = {
    answer: AnswerDto;
    title: I18nField;
    validationErrors: ValidationError[];
    question: SelfAssessmentQuestionEntity;
    listQuestionResponse: SelfAssessmentQuestionResponseEntity[];
};
