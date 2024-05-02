import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { AnswerValueDto } from '~self-assessments/http/dto/answer-assessment.dto';

export type ExtractValidationDataParams = {
    question: SelfAssessmentQuestionEntity;
    answerValue: AnswerValueDto;
    index?: number;
};
