import { CustomRepository, EntityCollection } from '@diginexhk/typeorm-helper';
import { BaseRepository } from '~core/repositories/base.repository';
import { SelfAssessmentGroupEntity } from '~self-assessments/entities/self-assessment-group.entity';

@CustomRepository(SelfAssessmentGroupEntity)
export class SelfAssessmentGroupRepository extends BaseRepository<SelfAssessmentGroupEntity> {
    getSelfAssessmentGroupByRoleId(roleId: string): Promise<SelfAssessmentGroupEntity[]> {
        return this.createQueryBuilder('SelfAssessmentGroup')
            .leftJoinAndSelect('SelfAssessmentGroup.questions', 'SelfAssessmentQuestion')
            .innerJoinAndSelect('SelfAssessmentQuestion.questionResponses', 'SelfAssessmentQuestionResponse')
            .where('SelfAssessmentGroup.roleId = :roleId', { roleId })
            .orderBy('SelfAssessmentGroup.order', 'ASC')
            .addOrderBy('SelfAssessmentQuestion.order', 'ASC')
            .addOrderBy('SelfAssessmentQuestionResponse.createdAt', 'ASC')
            .getMany();
    }

    listQuestionsNotIn(ids: string[], roleId: string): Promise<EntityCollection<SelfAssessmentGroupEntity>> {
        return this.createQueryBuilder('SelfAssessmentGroup')
            .innerJoinAndSelect('SelfAssessmentGroup.questions', 'SelfAssessmentQuestion')
            .innerJoinAndSelect('SelfAssessmentQuestion.questionResponses', 'SelfAssessmentQuestionResponse')
            .where('SelfAssessmentQuestion.id NOT IN (:...ids)', {
                ids
            })
            .andWhere('SelfAssessmentGroup.roleId = :roleId', { roleId })
            .orderBy('SelfAssessmentGroup.order', 'ASC')
            .addOrderBy('SelfAssessmentQuestion.order', 'ASC')
            .select([
                'SelfAssessmentGroup.id',
                'SelfAssessmentGroup.order',
                'SelfAssessmentGroup.title',
                'SelfAssessmentQuestion.id',
                'SelfAssessmentQuestion.order',
                'SelfAssessmentQuestion.conditions'
            ])
            .getMany();
    }

    getListSAQByRoles(roleId: string) {
        return this.createQueryBuilder('SelfAssessmentGroup')
            .leftJoinAndSelect('SelfAssessmentGroup.questions', 'SelfAssessmentQuestion')
            .innerJoinAndSelect('SelfAssessmentQuestion.questionResponses', 'SelfAssessmentQuestionResponse')
            .where('SelfAssessmentGroup.roleId = :roleId', { roleId })
            .orderBy('SelfAssessmentGroup.order', 'ASC')
            .addOrderBy('SelfAssessmentQuestion.order', 'ASC')
            .select([
                'SelfAssessmentGroup.id',
                'SelfAssessmentGroup.order',
                'SelfAssessmentGroup.title',
                'SelfAssessmentQuestion.id',
                'SelfAssessmentQuestion.order',
                'SelfAssessmentQuestion.conditions'
            ])
            .getMany();
    }
}
