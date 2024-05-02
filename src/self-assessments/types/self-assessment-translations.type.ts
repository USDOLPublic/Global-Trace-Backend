import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';

export type QuestionResponseTranslation = {
    questionResponseId: string;
} & Partial<SelfAssessmentQuestionResponseEntity>;

export type SelfAssessmentTranslation = {
    index?: number;
    questionId: string;
    questionResponses?: QuestionResponseTranslation[];
} & Partial<Omit<SelfAssessmentQuestionEntity, 'questionResponses'>>;
