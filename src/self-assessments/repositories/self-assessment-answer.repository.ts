import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';

@CustomRepository(SelfAssessmentAnswerEntity)
export class SelfAssessmentAnswerRepository extends BaseRepository<SelfAssessmentAnswerEntity> {
    listCompleteAnswersUniqueByQuestion(selfAssessmentId: string) {
        return this.createQueryBuilder('SelfAssessmentAnswer')
            .where({ selfAssessmentId })
            .distinctOn(['SelfAssessmentAnswer.selfAssessmentQuestionId'])
            .getMany();
    }

    listUniqueAnswers(selfAssessmentId: string) {
        return this.createQueryBuilder('SelfAssessmentAnswer')
            .where({ selfAssessmentId })
            .distinctOn(['SelfAssessmentAnswer.selfAssessmentQuestionId'])
            .orderBy('SelfAssessmentAnswer.selfAssessmentQuestionId', 'DESC')
            .addOrderBy('SelfAssessmentAnswer.createdAt', 'DESC')
            .getMany();
    }
}
