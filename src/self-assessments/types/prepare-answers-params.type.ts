import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { AnswerDto } from '~self-assessments/http/dto/answer-self-assessment.dto';

export type PrepareAnswersParams = {
    preparedAnswers: Partial<SelfAssessmentAnswerEntity>[];
    answer: AnswerDto;
    selfAssessmentId: string;
    groupId: string;
};
