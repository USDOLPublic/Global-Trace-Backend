import { CustomRepository } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';

@CustomRepository(SelfAssessmentQuestionEntity)
export class SelfAssessmentQuestionRepository extends BaseRepository<SelfAssessmentQuestionEntity> {
    findSelfAssessmentQuestionByRoleId(roleId: string): Promise<SelfAssessmentQuestionEntity[]> {
        return this.createQueryBuilder('SelfAssessmentQuestion')
            .innerJoin('SelfAssessmentQuestion.group', 'SelfAssessmentGroup')
            .where('SelfAssessmentGroup.roleId = :roleId', { roleId })
            .innerJoinAndSelect('SelfAssessmentQuestion.questionResponses', 'SelfAssessmentQuestionResponse')
            .select([
                'SelfAssessmentQuestion.id',
                'SelfAssessmentQuestion.title',
                'SelfAssessmentQuestionResponse.id',
                'SelfAssessmentQuestionResponse.option',
                'SelfAssessmentQuestionResponse.translation'
            ])
            .addOrderBy('SelfAssessmentQuestion.order', 'ASC')
            .getMany();
    }
}
