/* eslint-disable max-lines */
import { SortParams } from '@diginexhk/nestjs-base-decorator';
import { trans } from '@diginexhk/nestjs-cls-translation';
import { StorageService } from '@diginexhk/nestjs-storage';
import { TransactionService } from '@diginexhk/nestjs-transaction';
import { forwardRef, Inject, Injectable, StreamableFile } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { Response } from 'express';
import { cloneDeep, difference, first, flatMap, keyBy, orderBy } from 'lodash';
import moment from 'moment';
import path from 'path';
import { DeepPartial, In } from 'typeorm';
import { env } from '~config/env.config';
import { BadDataRequestException } from '~core/exceptions/bad-data-request.exception';
import { setHeaderDownloadZipFile } from '~core/helpers/zip-file.helper';
import { FacilityImportDataService } from '~facilities/services/facility-import-data.service';
import { CalculateFarmRiskScoreParam } from '~facilities/types/calculate-farm-risk-score-param.type';
import { PermissionEnum } from '~role-permissions/enums/permission.enum';
import { RoleService } from '~role-permissions/services/role.service';
import { SelfAssessmentAnswerEntity } from '~self-assessments/entities/self-assessment-answer.entity';
import { SelfAssessmentGroupEntity } from '~self-assessments/entities/self-assessment-group.entity';
import { SelfAssessmentQuestionResponseEntity } from '~self-assessments/entities/self-assessment-question-response.entity';
import { SelfAssessmentQuestionEntity } from '~self-assessments/entities/self-assessment-question.entity';
import { SelfAssessmentEntity } from '~self-assessments/entities/self-assessment.entity';
import { OptionTypeEnum } from '~self-assessments/enums/option-type.enum';
import { SelfAssessmentQuestionTypesEnum } from '~self-assessments/enums/self-assessment-question-types.enum.';
import { AnswerDto, AnswerSelfAssessmentDto } from '~self-assessments/http/dto/answer-self-assessment.dto';
import { GetSelfAssessmentListResponse } from '~self-assessments/http/response/get-self-assessment-list.response';
import { ListTemplateFileResponse } from '~self-assessments/http/response/list-template-file.response';
import { SelfAssessmentAnswerResponse } from '~self-assessments/http/response/self-assessment-answer.response';
import { SelfAssessmentRepository } from '~self-assessments/repositories/self-assessment.repository';
import { ValidationError } from '~self-assessments/types/answer-validation-error.type';
import { PrepareAnswersParams } from '~self-assessments/types/prepare-answers-params.type';
import { ValidateAndPrepareAnswersAssessment } from '~self-assessments/types/validate-and-prepare-answers-assessment.type';
import { ValidateAnswersEachGroupParams } from '~self-assessments/types/validate-answers-each-group-params.type';
import { UserEntity } from '~users/entities/user.entity';
import { UserService } from '~users/services/user.service';
import { SelfAssessmentAnswerService } from './self-assessment-answer.service';
import { SelfAssessmentGroupService } from './self-assessment-group.service';
import { SelfAssessmentQuestionResponseService } from './self-assessment-question-response.service';

@Injectable()
export class SelfAssessmentService extends TransactionService {
    public constructor(
        private selfAssessmentRepo: SelfAssessmentRepository,
        @Inject(forwardRef(() => SelfAssessmentGroupService))
        private selfAssessmentGroupService: SelfAssessmentGroupService,
        @Inject(forwardRef(() => SelfAssessmentAnswerService))
        private selfAssessmentAnswerService: SelfAssessmentAnswerService,
        @Inject(forwardRef(() => FacilityImportDataService))
        private facilityImportDataService: FacilityImportDataService,
        private roleService: RoleService,
        private storageService: StorageService,
        private userService: UserService,
        private selfAssessmentQuestionResponseService: SelfAssessmentQuestionResponseService
    ) {
        super();
    }

    getByFacilityId(facilityId: string) {
        return this.selfAssessmentRepo.findOneBy({ forFacilityId: facilityId });
    }

    findSelfSAQ(facilityId: string): Promise<SelfAssessmentEntity> {
        return this.selfAssessmentRepo.findOneByOrFail({ forFacilityId: facilityId });
    }

    async createSelfAssignment(roleId: string, forFacilityId: string) {
        const groups = await this.selfAssessmentGroupService.getSelfAssessmentGroupByRoleId(roleId);
        const questions = flatMap(groups, (item: SelfAssessmentGroupEntity) => item.questions);

        return this.saveSelfAssessment({
            forFacilityId,
            totalQuestions: questions.filter((question) => !question.conditions).length
        });
    }

    async getOrCreateSelfAssessment(roleId: string, forFacilityId: string) {
        const selfAssessment = await this.getByFacilityId(forFacilityId);

        if (!selfAssessment) {
            return this.createSelfAssignment(roleId, forFacilityId);
        }

        return selfAssessment;
    }

    async listSelfAssessmentsGroups(currentUser: UserEntity): Promise<GetSelfAssessmentListResponse> {
        const selfAssessment = await this.getOrCreateSelfAssessment(currentUser.roleId, currentUser.currentFacility.id);
        const saqQuestionsByGroup = await this.selfAssessmentGroupService.getSelfAssessmentGroupByRoleId(
            currentUser.roleId
        );
        const incompleteQuestions = await this.selfAssessmentGroupService.listIncompleteQuestionsByGroup(
            selfAssessment.id,
            cloneDeep(saqQuestionsByGroup)
        );
        const answers = await this.getAnswers(currentUser);
        const isDraft = !currentUser.answeredSaqAt && !!answers?.length;

        return {
            selfAssessment: {
                ...selfAssessment,
                incompleteQuestions,
                isDraft
            },
            groups: saqQuestionsByGroup
        };
    }

    private validateQuestionIds(data: AnswerSelfAssessmentDto, allQuestions: SelfAssessmentQuestionEntity[]) {
        const answerQuestionIds = data.answers.map(({ selfAssessmentQuestionId }) => selfAssessmentQuestionId);
        const allQuestionsIds = allQuestions.map(({ id }) => id);

        const invalidIds = difference(answerQuestionIds, allQuestionsIds);

        if (invalidIds.length) {
            throw new BadDataRequestException({ translate: `Have a questionId invalid: "${invalidIds[0]}"` });
        }
    }

    async getAnswers(currentUser: UserEntity): Promise<SelfAssessmentAnswerResponse[]> {
        const selfAssessment = await this.getOrCreateSelfAssessment(currentUser.roleId, currentUser.currentFacility.id);
        const selfAssessmentAnswers = await this.selfAssessmentAnswerService.getBySelfAssessment(selfAssessment.id);

        const questionResponseIds = this.getQuestionResponseIds(selfAssessmentAnswers);
        const listQuestionResponse = await this.selfAssessmentQuestionResponseService.find({
            where: { id: In(questionResponseIds) }
        });

        return this.mapSelfAssessmentAnswers(selfAssessmentAnswers, listQuestionResponse);
    }

    private mapSelfAssessmentAnswers(
        selfAssessmentAnswers: SelfAssessmentAnswerEntity[],
        listQuestionResponse: SelfAssessmentQuestionResponseEntity[]
    ): SelfAssessmentAnswerResponse[] {
        const mappedListQuestionResponse = keyBy(listQuestionResponse, 'id');

        return selfAssessmentAnswers.map((assessmentAnswer) => {
            return {
                ...assessmentAnswer,
                answers: assessmentAnswer.values.map(({ value, selfAssessmentQuestionResponseId }) => ({
                    value,
                    questionResponse: mappedListQuestionResponse[selfAssessmentQuestionResponseId]
                }))
            };
        });
    }

    private getQuestionResponseIds(selfAssessmentAnswers: SelfAssessmentAnswerEntity[]): string[] {
        return selfAssessmentAnswers
            .flatMap(({ values }) => values)
            .map(({ selfAssessmentQuestionResponseId }) => selfAssessmentQuestionResponseId);
    }

    saveSelfAssessment(data: { forFacilityId: string; totalQuestions: number; id?: string }) {
        return this.selfAssessmentRepo.save(data);
    }

    updateSelfAssessmentState(id: string, data: DeepPartial<SelfAssessmentEntity>) {
        return this.selfAssessmentRepo.updateOrFail({ id }, data);
    }

    async createSelfAssessmentFarmGroupAndFarms(
        farmGroupId: string,
        farms: CalculateFarmRiskScoreParam[],
        roleId: string
    ) {
        await Promise.all(
            farms.map(({ farmId, selfAssessments }) =>
                this.facilityImportDataService.createFarmSelfAssessment(farmId, selfAssessments, roleId)
            )
        );
        const selfAssessmentFarmGroup = await this.getOrCreateSelfAssessment(roleId, farmGroupId);
        selfAssessmentFarmGroup.answers = [];
    }

    async getSelfAssessmentFileOfRoles(key: string, sort: SortParams): Promise<ListTemplateFileResponse[]> {
        const roles = await this.roleService.getProductRolesHasPermission();
        if (!roles.length) {
            return [];
        }

        const listRoleWithTemplateFiles = await this.roleService.getSelfAssessmentFileOfRoles(roles, key, sort);

        return listRoleWithTemplateFiles.map(
            ({
                id,
                name,
                saqStatus,
                saqTranslationStatus,
                hasFacilityGroupTemplate,
                fileSaq,
                fileFacilityGroupTemplate,
                fileSaqTranslation
            }) => ({
                id,
                name,
                status: { saqStatus, saqTranslationStatus },
                hasFacilityGroupTemplate,
                fileSaq: fileSaq
                    ? { link: this.storageService.getFileUrl(fileSaq.blobName), fileName: fileSaq.blobName }
                    : null,
                fileFacilityGroupTemplate: fileFacilityGroupTemplate
                    ? {
                          link: this.storageService.getFileUrl(fileFacilityGroupTemplate.blobName),
                          fileName: fileFacilityGroupTemplate.blobName
                      }
                    : null,
                fileSaqTranslation: fileSaqTranslation
                    ? {
                          link: this.storageService.getFileUrl(fileSaqTranslation.blobName),
                          fileName: fileSaqTranslation.blobName
                      }
                    : null
            })
        );
    }

    async downloadTemplate(roleId: string, res: Response) {
        const canAdminCompletesProfile = await this.roleService.checkRoleHasPermission(
            PermissionEnum.ADMINISTRATOR_COMPLETES_PROFILE,
            roleId
        );

        const zip = new AdmZip();

        if (canAdminCompletesProfile) {
            this.addTemplateToZip(zip, 'SAQ(facility-group).xlsx');
            this.addTemplateToZip(zip, 'facility-group-template.xlsx');
        } else {
            this.addTemplateToZip(zip, 'SAQ.xlsx');
        }

        setHeaderDownloadZipFile(res, 'templates');
        return new StreamableFile(zip.toBuffer()).getStream().pipe(res);
    }

    addTemplateToZip(zip: AdmZip, fileName: string): void {
        const excelFilePath = path.join(env.ROOT_PATH, `static/xlsx-template/${fileName}`);
        zip.addLocalFile(excelFilePath, '', fileName);
    }

    async answerAssessment(currentUser: UserEntity, data: AnswerSelfAssessmentDto): Promise<ValidationError[]> {
        const [selfAssessment, groups] = await Promise.all([
            this.findSelfSAQ(currentUser.currentFacility.id),
            this.selfAssessmentGroupService.getSelfAssessmentGroupByRoleId(currentUser.roleId)
        ]);

        await this.selfAssessmentAnswerService.removeBySelfAssessmentId(selfAssessment.id);
        const questions = flatMap(groups, (item: SelfAssessmentGroupEntity) => item.questions);
        this.validateQuestionIds(data, questions);

        const { validationErrors, preparedAnswers } = this.validateAndPrepareAnswersAssessment(
            data,
            groups,
            selfAssessment.id
        );

        const isCompletedSaq = !validationErrors.length;
        await this.selfAssessmentAnswerService.createMany(preparedAnswers);

        if (currentUser && isCompletedSaq) {
            await this.userService.updateAnsweredSaqAt(currentUser);
        }

        await this.selfAssessmentRepo.update(
            { id: selfAssessment.id },
            { completedSaqAt: isCompletedSaq ? moment().toDate() : null }
        );

        return validationErrors;
    }

    private validateAndPrepareAnswersAssessment(
        { answers }: AnswerSelfAssessmentDto,
        groups: SelfAssessmentGroupEntity[],
        selfAssessmentId: string
    ): ValidateAndPrepareAnswersAssessment {
        const validationErrors: ValidationError[] = [];
        const preparedAnswers: Partial<SelfAssessmentAnswerEntity>[] = [];
        const mappedAnswers = keyBy(answers, 'selfAssessmentQuestionId');

        for (const group of groups) {
            const { questions } = group;
            const firstQuestion = group.questions.find(({ order }) => order === 1);
            const mappedQuestions = keyBy(questions, 'id');

            this.validateAnswersEachGroup({
                group,
                mappedAnswers,
                mappedQuestions,
                validationErrors,
                preparedAnswers,
                selfAssessmentId,
                question: firstQuestion
            });
        }

        return { validationErrors, preparedAnswers };
    }

    private validateAnswersEachGroup({
        mappedAnswers,
        question,
        mappedQuestions,
        validationErrors,
        preparedAnswers,
        selfAssessmentId,
        group
    }: ValidateAnswersEachGroupParams): ValidateAndPrepareAnswersAssessment {
        if (!question) {
            return;
        }

        const validQuestionResponse = this.getValidQuestionResponseAndPrepareAnswers({
            group,
            answer: mappedAnswers[question.id],
            selfAssessmentId,
            validationErrors,
            question,
            preparedAnswers
        });

        return this.validateAnswersEachGroup({
            group,
            mappedAnswers,
            mappedQuestions,
            validationErrors,
            preparedAnswers,
            selfAssessmentId,
            question: mappedQuestions[validQuestionResponse?.nextQuestionId]
        });
    }

    private getValidQuestionResponseAndPrepareAnswers({
        group,
        answer,
        selfAssessmentId,
        validationErrors,
        question,
        preparedAnswers
    }: ValidateAnswersEachGroupParams) {
        const { title, id: groupId } = group;
        const validQuestionResponse = this.getValidQuestionResponse(answer, question);

        if (!validQuestionResponse) {
            validationErrors.push({
                title,
                questionOrder: question.order,
                error: trans('validation.invalid_answer_self_assessment')
            });

            return this.getQuestionResponseWithRiskLevel(question.questionResponses);
        }

        this.prepareAnswers({ preparedAnswers, answer, selfAssessmentId, groupId });

        return validQuestionResponse;
    }

    private getValidQuestionResponse(
        answer: AnswerDto,
        question: SelfAssessmentQuestionEntity
    ): SelfAssessmentQuestionResponseEntity {
        if (!answer) {
            return;
        }

        const listValidQuestionResponse = this.getListValidQuestionResponse(answer, question);

        return this.getQuestionResponseWithRiskLevel(listValidQuestionResponse);
    }

    private getListValidQuestionResponse(
        answer: AnswerDto,
        question: SelfAssessmentQuestionEntity
    ): SelfAssessmentQuestionResponseEntity[] {
        const listValidQuestionResponse = [];
        const mappedQuestionResponses = keyBy(question.questionResponses, 'id');

        for (const { selfAssessmentQuestionResponseId, value } of answer.answerValues) {
            const questionResponse = mappedQuestionResponses[selfAssessmentQuestionResponseId];

            if (
                !this.isQuestionResponseBelongToQuestion(
                    question.questionResponses,
                    selfAssessmentQuestionResponseId
                ) ||
                !this.isValidAnswerBelongToOther(value, mappedQuestionResponses[selfAssessmentQuestionResponseId]) ||
                !this.isValidAnswerWithIntegerAndText(question, value)
            ) {
                return [];
            }

            listValidQuestionResponse.push(questionResponse);
        }

        return listValidQuestionResponse;
    }

    private prepareAnswers({ preparedAnswers, answer, selfAssessmentId, groupId }: PrepareAnswersParams): void {
        const { selfAssessmentQuestionId, answerValues } = answer;
        preparedAnswers.push({
            groupId,
            isDraft: false,
            selfAssessmentId,
            selfAssessmentQuestionId,
            values: answerValues
        });
    }

    getQuestionResponseWithRiskLevel(
        questionResponses: SelfAssessmentQuestionResponseEntity[]
    ): SelfAssessmentQuestionResponseEntity {
        const hasRiskLevel = questionResponses.some(({ riskLevel }) => riskLevel);
        if (hasRiskLevel) {
            const sortedQuestionResponses = orderBy(questionResponses, 'riskLevel', 'desc');
            return first(sortedQuestionResponses);
        }

        return first(questionResponses);
    }

    isQuestionResponseBelongToQuestion(
        questionResponses: SelfAssessmentQuestionResponseEntity[],
        questionResponseId: string
    ): boolean {
        return questionResponses.some(({ id }) => id === questionResponseId);
    }

    private isValidAnswerWithIntegerAndText(question: SelfAssessmentQuestionEntity, value: string): boolean {
        return (
            !(question.type === SelfAssessmentQuestionTypesEnum.NUMBER && !/^\d+$/.test(value)) &&
            !(question.type === SelfAssessmentQuestionTypesEnum.FREE_TEXT && !value)
        );
    }

    isValidAnswerBelongToOther(value: string, questionResponse: SelfAssessmentQuestionResponseEntity): boolean {
        return !(questionResponse?.optionType === OptionTypeEnum.OTHER && !value);
    }

    async deleteAnswerBySelfAssessment(selfAssessmentIds: string[]) {
        if (selfAssessmentIds.length) {
            await this.selfAssessmentAnswerService.removeAnswersBySelfAssessment(selfAssessmentIds);
        }
    }
}
