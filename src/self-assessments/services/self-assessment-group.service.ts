/* eslint-disable @typescript-eslint/naming-convention */
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Dictionary, keyBy } from 'lodash';
import { DeleteResult, FindManyOptions, FindOptionsWhere, In } from 'typeorm';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { SelfAssessmentGroupEntity } from '~self-assessments/entities/self-assessment-group.entity';
import { SelfAssessmentGroupRepository } from '~self-assessments/repositories/self-assessment-group.repository';
import { SelfAssessmentAnswerService } from '~self-assessments/services/self-assessment-answer.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { SelfAssessmentService } from './self-assessment.service';
import { GetIncompleteQuestionsParams } from '~self-assessments/types/get-incomplete-questions-params.type';

@Injectable()
export class SelfAssessmentGroupService extends TransactionService {
    public constructor(
        private selfAssessmentGroupRepo: SelfAssessmentGroupRepository,
        @Inject(forwardRef(() => SelfAssessmentAnswerService))
        private selfAssessmentAnswerService: SelfAssessmentAnswerService,
        @Inject(forwardRef(() => SelfAssessmentService))
        private selfAssessmentService: SelfAssessmentService
    ) {
        super();
    }

    getSelfAssessmentGroupByRoleId(roleId: string): Promise<SelfAssessmentGroupEntity[]> {
        return this.selfAssessmentGroupRepo.getSelfAssessmentGroupByRoleId(roleId);
    }

    async listIncompleteQuestionsByGroup(
        selfAssessmentId: string,
        saqQuestionsByGroup: SelfAssessmentGroupEntity[]
    ): Promise<SelfAssessmentGroupEntity[]> {
        const listCompleteAnswersOfSAQ = await this.selfAssessmentAnswerService.listCompleteAnswersUniqueByQuestion(
            selfAssessmentId
        );
        const mappedCompleteAnswersOfSAQ = keyBy(listCompleteAnswersOfSAQ, 'selfAssessmentQuestionId');
        const listIncompleteQuestionsByGroup: SelfAssessmentGroupEntity[] = [];

        for (const group of saqQuestionsByGroup) {
            const firstQuestion = group.questions.find(({ order }) => order === 1);
            const mappedQuestions = keyBy(group.questions, 'id');
            const listIncompleteQuestions: SelfAssessmentQuestionEntity[] = [];

            this.getIncompleteQuestions({
                mappedQuestions,
                mappedCompleteAnswersOfSAQ,
                listIncompleteQuestions,
                question: firstQuestion
            });

            if (listIncompleteQuestions.length) {
                listIncompleteQuestionsByGroup.push({
                    ...group,
                    questions: listIncompleteQuestions
                } as SelfAssessmentGroupEntity);
            }
        }

        return listIncompleteQuestionsByGroup;
    }

    private getIncompleteQuestions({
        question,
        mappedQuestions,
        mappedCompleteAnswersOfSAQ,
        listIncompleteQuestions
    }: GetIncompleteQuestionsParams): void {
        if (!question) {
            return;
        }
        const nextQuestionId = this.getNextQuestionId(question, mappedCompleteAnswersOfSAQ, listIncompleteQuestions);

        return this.getIncompleteQuestions({
            mappedQuestions,
            mappedCompleteAnswersOfSAQ,
            listIncompleteQuestions,
            question: mappedQuestions[nextQuestionId]
        });
    }

    private getNextQuestionId(
        question: SelfAssessmentQuestionEntity,
        mappedCompleteAnswersOfSAQ: Dictionary<SelfAssessmentAnswerEntity>,
        listIncompleteQuestions: SelfAssessmentQuestionEntity[]
    ): string {
        const completeAnswerOfSAQ = mappedCompleteAnswersOfSAQ[question.id];

        if (!completeAnswerOfSAQ) {
            listIncompleteQuestions.push(question);
            const questionResponse = this.selfAssessmentService.getQuestionResponseWithRiskLevel(
                question.questionResponses
            );

            return questionResponse.nextQuestionId;
        }

        return this.getNextQuestionIdByCompleteAnswer(completeAnswerOfSAQ, question);
    }

    private getNextQuestionIdByCompleteAnswer(
        completeAnswerOfSAQ: SelfAssessmentAnswerEntity,
        question: SelfAssessmentQuestionEntity
    ): string {
        const completeQuestionResponseIds = completeAnswerOfSAQ.values.map(
            ({ selfAssessmentQuestionResponseId }) => selfAssessmentQuestionResponseId
        );
        const completeQuestionResponses = question.questionResponses.filter(({ id }) =>
            completeQuestionResponseIds.includes(id)
        );

        const { nextQuestionId } =
            this.selfAssessmentService.getQuestionResponseWithRiskLevel(completeQuestionResponses);

        return nextQuestionId;
    }

    findGroupInIds(ids: string[]): Promise<SelfAssessmentGroupEntity[]> {
        return this.selfAssessmentGroupRepo.findBy({ id: In(ids) });
    }

    create(data: QueryDeepPartialEntity<SelfAssessmentGroupEntity>): Promise<SelfAssessmentGroupEntity> {
        return this.selfAssessmentGroupRepo.createOne(data);
    }

    delete(options: FindOptionsWhere<SelfAssessmentGroupEntity>): Promise<DeleteResult> {
        return this.selfAssessmentGroupRepo.delete(options);
    }

    find(options: FindManyOptions<SelfAssessmentGroupEntity>): Promise<SelfAssessmentGroupEntity[]> {
        return this.selfAssessmentGroupRepo.find(options);
    }
}
