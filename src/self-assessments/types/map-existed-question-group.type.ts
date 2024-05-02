import { Dictionary } from 'lodash';
import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';

export type MapExistedQuestionGroup = {
    mappedExistedQuestions: Dictionary<SelfAssessmentQuestionEntity>;
    mappedExistedQuestionResponses: Dictionary<SelfAssessmentQuestionResponseEntity>;
};
