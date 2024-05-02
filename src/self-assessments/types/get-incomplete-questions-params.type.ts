import { Dictionary } from 'lodash';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';

export type GetIncompleteQuestionsParams = {
    question: SelfAssessmentQuestionEntity;
    mappedQuestions: Dictionary<SelfAssessmentQuestionEntity>;
    mappedCompleteAnswersOfSAQ: Dictionary<SelfAssessmentAnswerEntity>;
    listIncompleteQuestions: SelfAssessmentQuestionEntity[];
};
