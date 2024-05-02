import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';

export type AnswerGroupByQuestion = {
    [selfAssessmentQuestionId: string]: SelfAssessmentAnswerEntity[];
};
