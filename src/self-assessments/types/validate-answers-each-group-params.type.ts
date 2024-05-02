import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { ValidationError } from './answer-validation-error.type';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { Dictionary } from 'lodash';
import { SelfAssessmentGroupEntity } from '~self-assessments/entities/self-assessment-group.entity';
import { AnswerDto } from '~self-assessments/http/dto/answer-self-assessment.dto';

export type ValidateAnswersEachGroupParams = {
    mappedAnswers?: Dictionary<AnswerDto>;
    question: SelfAssessmentQuestionEntity;
    mappedQuestions?: Dictionary<SelfAssessmentQuestionEntity>;
    validationErrors: ValidationError[];
    preparedAnswers: Partial<SelfAssessmentAnswerEntity>[];
    selfAssessmentId: string;
    group: SelfAssessmentGroupEntity;
    answer?: AnswerDto;
};
