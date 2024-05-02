import { AnswerDto } from '~self-assessments/http/dto/answer-assessment.dto';
import { Dictionary } from 'lodash';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { SelfAssessmentEntity } from '~self-assessments/entities/self-assessment.entity';
import { UserEntity } from '~users/entities/user.entity';

export type SaveSelfAssessmentAnswerParamsType = {
    filledAnswers: AnswerDto[];
    questionsById: Dictionary<SelfAssessmentQuestionEntity>;
    selfAssessment: SelfAssessmentEntity;
    questions: SelfAssessmentQuestionEntity[];
    currentUser?: UserEntity;
};
