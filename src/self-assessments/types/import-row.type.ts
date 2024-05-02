import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';

export type ImportRow = {
    questionId: string;
    index: number;
    responseEntities: SelfAssessmentQuestionResponseEntity[];
    lastResponseCreateAt: number;
};
